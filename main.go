package main

import (
	"embed"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/infinage/ecom-trading/internal/handlers"
)

//go:embed assets
var assets embed.FS

func main() {
	// Seed data if env variable is set
	seedDB, err := strconv.ParseBool(os.Getenv("POPULATE_SEED_DATA"))
	if err != nil {
		seedDB = false
	}

	app, err := handlers.NewApp("data.db", assets, seedDB)
	if err != nil {
		log.Fatalf("Failed to init app: %v", err)
	}

	addr := ":8080"
	log.Println("Listening on ADDR:", addr)

	mux := app.Routes()
	if err = http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
