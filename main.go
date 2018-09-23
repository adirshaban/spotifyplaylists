package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"github.com/zmb3/spotify"
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
	auth          = spotify.NewAuthenticator(redirectURI, spotify.ScopeUserReadPrivate)
	spotifyClient *spotify.Client
	redisClient   *redis.Client
)

func init() {
	rand.Seed(time.Now().UnixNano())
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

func searchSpotify(w http.ResponseWriter, r *http.Request) {
	// results, err := spotifyClient.Search(r.FormValue("term"), spotify.SearchTypeArtist)
}
