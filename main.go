package main

import (
	"context"
	"log"
	"os"

	"github.com/infinage/ecom-trading/internal/models"
)

func main() {
	st, err := models.NewStore("test.db")
	if err != nil {
		log.Fatalf("DB load fail: %v", err)
	}

	ctx := context.Background()
	if err = st.Init(ctx); err != nil {
		log.Fatalf("DB init fail: %v", err)
	}

	f, err := os.Open("assets/data/seed.json")
	if err != nil {
		log.Fatalf("Failed to open seed file: %v", err)
	}

	sst, err := models.Seed(ctx, f, st)
	if err != nil {
		log.Fatalf("Failed to load seed: %v", err)
	}

	log.Printf("Inserted %d/%d new users, %d/%d new products\n", sst.InsertedUsers,
		sst.TotalUsers, sst.InsertedProducts, sst.TotalProducts)
}
