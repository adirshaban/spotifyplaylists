package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zmb3/spotify"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

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
	ch            = make(chan *spotify.Client)
	state         = RandStringBytesRmndr(10)
	spotifyClient *spotify.Client
)

func main() {
	r := gin.Default()

	r.GET("/callback", completeAuth)
	go r.Run(":8080")
	http.HandleFunc("/search", searchSpotify)
	http.HandleFunc("/AuthURL", getAuthURL)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Got request for:", r.URL.String())
	})

	// go http.ListenAndServe(":8080", nil)

	url := auth.AuthURL(state)
	fmt.Println("Please log in to Spotify by visiting the following page in your browser:", url)
	spotifyClient = <-ch

	user, err := spotifyClient.CurrentUser()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("You are logged in as:", user.ID)

}

func completeAuth(c *gin.Context) {
	tok, err := auth.Token(state, c.Request)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}

	// check if the current request has the same context
	if st := c.Query("state"); st != state {
		c.JSON(http.StatusNotFound, gin.H{"error": "State mismatch"})
		log.Fatalf("State mismatch: %s != %s\n", st, state)
	}
	client := auth.NewClient(tok)
	c.String(http.StatusOK, "Login Complete")
	ch <- &client
}

func getAuthURL(w http.ResponseWriter, r *http.Request) {

}

func searchSpotify(w http.ResponseWriter, r *http.Request) {
	// results, err := spotifyClient.Search(r.FormValue("term"), spotify.SearchTypeArtist)
}
