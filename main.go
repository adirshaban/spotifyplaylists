package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"

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
	auth          = spotify.NewAuthenticator(redirectURI, spotify.ScopePlaylistModifyPublic)
	spotifyClient *spotify.Client
	redisClient   *redis.Client
)

func init() {
	// inits the rand time
	rand.Seed(time.Now().UnixNano())

	// Inits the redis client
	redisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

func main() {
	r := gin.Default()

	r.GET("/callback", completeAuth)
	r.GET("/authurl", getAuthURL)
	r.GET("/search", searchSpotify)
	r.POST("/playlist", createPlaylist)
	r.Run(":8080")
}

func completeAuth(c *gin.Context) {
	queryState := c.Query("state")
	tok, err := auth.Token(queryState, c.Request)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
	state, err := redisClient.Get(queryState).Result()
	if err != nil {
		panic(err)
	}

	// TODO: remove key maybe

	// check if the current request has the same context
	if state == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "State mismatch"})
		log.Fatalf("State does not exist: %s\n", queryState)
	}

	c.JSON(http.StatusOK, gin.H{"accessToken": tok.AccessToken})
}

func getAuthURL(c *gin.Context) {
	state := RandStringBytesRmndr(10)
	url := auth.AuthURL(state)

	err := redisClient.Set(state, 0, 0).Err()
	if err != nil {
		panic(err)
	}

	c.JSON(http.StatusOK, gin.H{"authurl": url})
}

func searchSpotify(c *gin.Context) {
	token := c.GetHeader("spotify-access-token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided."})
	}

	client := auth.NewClient(&oauth2.Token{AccessToken: token})
	results, err := client.Search(c.Query("term"), spotify.SearchTypeArtist)
	if err != nil {
		panic(err)
	}
	c.JSON(http.StatusOK, gin.H{"results": results})
}

/*
User should send post request with body as follow:
{
	artists: [{artist: ID, tracks: TRACKS_NUMBER}],
	name: NAME,
	public: true/fales
}
if TRACKS_NUMEBR is 0 then all tracks from artist are added, otherwise gets the top X tracks
*/
func createPlaylist(c *gin.Context) {
	token := c.GetHeader("spotify-access-token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided."})
	}

	client := auth.NewClient(&oauth2.Token{AccessToken: token})
	playlistName := c.GetString("name")
	isPublic := c.GetBool("public")
	currentUesr, err := client.CurrentUser()
	if err != nil {
		panic(err)
	}
	playlist, err := client.CreatePlaylistForUser(currentUesr.ID, playlistName, isPublic)
	if err != nil {
		panic(err)
	}
	artists, _ := c.Get("artists")

	c.JSON(http.StatusOK, gin.H{"fiuc": artists, "playlist": playlist})
}
