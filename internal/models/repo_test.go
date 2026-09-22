package models

import (
	"context"
	"strings"
	"testing"
)

func Test_RepoInit(t *testing.T) {
	st, err := NewStore(":memory:")
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	ctx := context.Background()
	products, err := st.GetAllValidProducts(ctx)
	if err == nil {
		t.Error("Expected error but got nil")
	} else if len(products) != 0 {
		t.Errorf("Expected to return 0 products from fresh store, got: %v", products)
	}

	if err = st.Init(ctx); err != nil {
		t.Errorf("Unexpected error during table init: %v", err)
	}

	if err = st.Init(ctx); err != nil {
		t.Errorf("Unexpected error during table re-init: %v", err)
	}

	if products, err = st.GetAllValidProducts(ctx); err != nil {
		t.Errorf("GetAllProducts after init returned error: %v", err)
	} else if len(products) != 0 {
		t.Errorf("Expected to return 0 products from store post init, got: %v", products)
	}
}

func Test_Seed(t *testing.T) {
	st, err := NewStore(":memory:")
	if err != nil {
		t.Errorf("Unexpected error during store init: %v", err)
	}

	ctx := context.Background()
	if err = st.Init(ctx); err != nil {
		t.Errorf("Store init fail: %v", err)
	}

	seedData := `
	{
		"users": [
			{
				"id": 1,
				"name": "Amazon India",
				"email": "amazon@deesa.com",
				"password": "amazon@123"
			}
		]
	}
	`

	// Validate seeding of users works okay
	sst, err := Seed(ctx, strings.NewReader(seedData), st)
	if err != nil {
		t.Errorf("Unxpected error from seed: %v", err)
	} else if tu, iu := sst.TotalUsers, sst.InsertedUsers; tu != 1 || iu != 1 {
		t.Errorf("Expected to load 1/1 users, got %d/%d", iu, tu)
	} else if tp, ip := sst.TotalProducts, sst.InsertedProducts; tp != 0 || ip != 0 {
		t.Errorf("Expected to load 0 products, got %d/%d", ip, tp)
	}

	// Validate user inserted correctly
	if u, err := st.GetUserByID(ctx, 1); err != nil {
		t.Errorf("Expected to find user id #1 after seed, got: %v", err)
	} else if u.ID != 1 || u.Name != "Amazon India" || u.Email != "amazon@deesa.com" {
		t.Errorf("\n\tID = %d (want 1)\n\tName = %q (want 'Amazon India')"+
			"\n\temail = %q (want 'amazon@deesa.com')", u.ID, u.Name, u.Email)
	} else if !u.ComparePassword("amazon@123") {
		t.Error("ComparePassword failed for seeded user")
	}

	seedData = `
	{
		"products": [
			{
				"id": 1,
				"title": "Gaming console",
				"price": 109.95,
				"category": "Electronics",
				"seller": 1
			}
		]
	}
	`

	// Validate seeding of products post user insertion
	sst, err = Seed(ctx, strings.NewReader(seedData), st)
	if err != nil {
		t.Errorf("Unxpected error from seed: %v", err)
	} else if tu, iu := sst.TotalUsers, sst.InsertedUsers; tu != 0 || iu != 0 {
		t.Errorf("Expected to load 0 users, got %d/%d", iu, tu)
	} else if tp, ip := sst.TotalProducts, sst.InsertedProducts; tp != 1 || ip != 1 {
		t.Errorf("Expected to load 1/1 products, got %d/%d", ip, tp)
	}

	// Validate product has been inserted right
	if p, err := st.GetProductByID(ctx, 1); err != nil {
		t.Errorf("Expected to find product id #1 after seed, got: %v", err)
	} else if p.ID != 1 || p.Title != "Gaming console" || p.Price != 109.95 || p.Category != CategoryElectronics || p.SellerID != 1 {
		t.Errorf("Product field mismatch, got %v", p)
	}
}
