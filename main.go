package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/infinage/ecom-trading/internal/models"
)

func main() {
	st, err := models.NewStore("test.db")
	if err != nil {
		log.Fatalf("DB load fail: %v", err)
	}

	ctx := context.TODO()
	if err = st.Init(ctx); err != nil {
		log.Fatalf("DB init fail: %v", err)
	}

	f, err := os.Open("assets/data/seed.json")
	if err != nil {
		log.Fatalf("Seed file failed to load: %v", err)
	}

	var data struct {
		Users []struct {
			ID       int64  `json:"id"`
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
			Address  string `json:"address"`
		} `json:"Users"`

		Products []struct {
			ID          int64   `json:"id"`
			Title       string  `json:"title"`
			Price       float32 `json:"price"`
			Description string  `json:"description"`
			Category    string  `json:"category"`
			Image       string  `json:"image"`
			Seller      int64   `json:"seller"`
		} `json:"products"`
	}

	dec := json.NewDecoder(f)
	if err = dec.Decode(&data); err != nil {
		log.Fatalf("Failed to parse seed file: %v", err)
	}

	var usersInserted int
	for idx, U := range data.Users {
		u, err := models.NewUser(U.Name, U.Email, U.Password, U.Address)
		u.ID = U.ID
		if err != nil {
			log.Printf("Skipping rec #%d: %v\n", idx+1, err)
			continue
		}

		if err = st.CreateUser(ctx, u); err != nil {
			log.Printf("Failed to persist rec #%d: %v\n", idx+1, err)
			continue
		}

		usersInserted++
	}

	var productsInserted int
	for idx, P := range data.Products {
		p, err := models.NewProduct(P.Title, P.Description, P.Price,
			models.ProductCategory(P.Category), P.Image, P.Seller)
		p.ID = P.ID
		if err != nil {
			log.Printf("Skipping rec #%d: %v\n", idx+1, err)
			continue
		}

		if err = st.CreateProduct(ctx, p); err != nil {
			log.Printf("Failed to persist rec #%d: %v\n", idx+1, err)
			continue
		}

		productsInserted++
	}

	log.Printf("Inserted %d new users, %d new products\n", usersInserted, productsInserted)
}
