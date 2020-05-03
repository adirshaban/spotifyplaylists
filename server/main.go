package main

import (
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"github.com/zmb3/spotify"
	"golang.org/x/oauth2"
)

const (
	redirectURI = "http://localhost:8080/callback"
	letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
)

// RandStringBytesRmndr - used to create state - uniuqe 10 characters
func RandStringBytesRmndr(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Int63()%int64(len(letterBytes))]
	}
	return string(b)
}

var (
	auth          = spotify.NewAuthenticator(redirectURI, spotify.ScopePlaylistModifyPrivate, spotify.ScopeUserReadPrivate, spotify.ScopePlaylistModifyPublic)
	spotifyClient *spotify.Client
	redisClient   *redis.Client
)

func init() {
	// inits the rand time
	rand.Seed(time.Now().UnixNano())
}

func main() {
	// Logging to a file.
	logFile, _ := os.Create("app.log")
	gin.DefaultWriter = io.MultiWriter(logFile, os.Stdout)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "spotify-access-token", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/callback", completeAuth)
	router.GET("/login", login)
	router.GET("/search", searchSpotify)
	router.POST("/playlist", createPlaylist)
	router.Run(":8080")
}

func completeAuth(c *gin.Context) {
	queryState := c.Query("state")
	storedCockie, _ := c.Cookie("state")
	fmt.Printf("Query %s \n Stored %s", queryState, storedCockie)
	// check if the current request has the same context
	if queryState != storedCockie {
		c.JSON(http.StatusNotFound, gin.H{"error": "State mismatch"})
		log.Fatalf("State does not exist: Query - %s  Stored - %s\n", queryState, storedCockie)
	}

	tok, err := auth.Token(queryState, c.Request)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}

	c.Redirect(http.StatusPermanentRedirect, fmt.Sprintf("http://localhost:3000/#access_token=%s", tok.AccessToken))
	// c.JSON(http.StatusOK, gin.H{"accessToken": tok.AccessToken})
}

func login(c *gin.Context) {
	state := RandStringBytesRmndr(10)
	url := auth.AuthURL(state)

	c.SetCookie("state", state, 1, "/", "localhost", false, false)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func searchSpotify(c *gin.Context) {
	token := c.GetHeader("spotify-access-token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided."})
	}

	client := auth.NewClient(&oauth2.Token{AccessToken: token})
	results, err := client.Search(c.Query("term"), spotify.SearchTypeArtist)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		panic(err)
	}
	c.JSON(http.StatusOK, gin.H{"results": results})
}

/*
User should send post request with body as follow:
{
	artists: [{artist: ID, tophits: true/false}],
	name: NAME,
	public: true/fales
}
if TopHits is true only the top hits will be added otherwise all tracks will be added
*/

func createPlaylist(c *gin.Context) {
	type Artist struct {
		ID      spotify.ID `json:"id" binding:"required"`
		TopHits bool       `json:"tophits" binding:"required"`
	}

	type PlaylistBody struct {
		Name     string   `json:"name" binding:"required"`
		IsPublic bool     `json:"ispublic" binding:"required"`
		Artists  []Artist `json:"artists" binding:"required"`
	}

	token := c.GetHeader("spotify-access-token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided."})
	}

	client := auth.NewClient(&oauth2.Token{AccessToken: token})
	var body PlaylistBody
	c.Bind(&body)

	currentUesr, err := client.CurrentUser()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		panic(err)
	}

	playlist, err := client.CreatePlaylistForUser(currentUesr.ID, body.Name, body.IsPublic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		panic(err)
	}

	// Adds the tracks to the playlist
	for _, artist := range body.Artists {
		if artist.TopHits {
			tracks, err := client.GetArtistsTopTracks(artist.ID, currentUesr.Country)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err})
				panic(err)
			}
			var ids []spotify.ID

			for _, track := range tracks {
				ids = append(ids, track.ID)
			}
			client.AddTracksToPlaylist(currentUesr.ID, playlist.ID, ids...)
		} else {
			// gets the albums
			albums, err := client.GetArtistAlbums(artist.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err})
				panic(err)
			}

			for hasMore := true; hasMore; hasMore = albums.Next != "" {
				for _, album := range albums.Albums {
					var ids []spotify.ID
					tracks, err := client.GetAlbumTracks(album.ID)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{"error": err})
						panic(err)
					}

					// TODO: handle tbe tracks page

					for _, track := range tracks.Tracks {
						ids = append(ids, track.ID)
					}

					client.AddTracksToPlaylist(currentUesr.ID, playlist.ID, ids...)
				}

			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"playlist": playlist})
}
