package models

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
)

type seedJSON struct {
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
		Qty         uint    `json:"qty"`
		Description string  `json:"description"`
		Category    string  `json:"category"`
		Image       string  `json:"image"`
		Seller      int64   `json:"seller"`
	} `json:"products"`
}

type seedStat struct {
	InsertedUsers, TotalUsers       int
	InsertedProducts, TotalProducts int
}

// Seed takes in a reader object and inserts the records into the store. If ID
// has been set, it force sets that ID from seed file, otherwise lets DB pick
// auto pick it.
func Seed(ctx context.Context, r io.Reader, st *Store) (seedStat, error) {
	var data seedJSON
	dec := json.NewDecoder(r)
	if err := dec.Decode(&data); err != nil {
		return seedStat{}, fmt.Errorf("seed file parse fail: %w", err)
	}

	var stat = seedStat{TotalUsers: len(data.Users), TotalProducts: len(data.Products)}
	for _, U := range data.Users {
		u, err := NewUser(U.Name, U.Email, U.Password, U.Address)
		if err != nil {
			continue
		}

		u.ID = U.ID // Force set ID from seed file
		if err = st.CreateUser(ctx, u); err != nil {
			continue
		}

		stat.InsertedUsers++ // incr only on success
	}

	for _, P := range data.Products {
		p, err := NewProduct(P.Title, P.Description, P.Price, P.Qty,
			ProductCategory(P.Category), P.Image, P.Seller)

		if err != nil {
			continue
		}

		p.ID = P.ID // Force set from seed (if 0, CreateProduct auto sets it)
		if err = st.CreateProduct(ctx, p); err != nil {
			continue
		}

		stat.InsertedProducts++ // incr only on success
	}

	return stat, nil
}
