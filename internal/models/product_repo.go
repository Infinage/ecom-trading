package models

import (
	"context"
	"fmt"
)

// getProducts is a helper to reduce some boiler plate.
func (s *Store) getProducts(ctx context.Context, query string,
	args ...any) ([]Product, error) {

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(
			&p.ID,
			&p.Title,
			&p.Description,
			&p.Price,
			&p.Category,
			&p.Image,
			&p.StockCount,
			&p.SellerID,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

// GetAllProducts fetches all products found in DB.
func (s *Store) GetAllProducts(ctx context.Context) ([]Product, error) {
	query := `
		SELECT id, title, description, price, category, image, count, seller 
		FROM products
	`
	return s.getProducts(ctx, query)
}

// GetProductsBySeller returns all products offered by seller.
func (s *Store) GetProductsBySeller(ctx context.Context, seller int64) ([]Product, error) {
	query := `
		SELECT id, title, description, price, category, image, count, seller 
		FROM products WHERE seller = ?
	`
	return s.getProducts(ctx, query, seller)
}

// GetProductsByCategory returns all products belonging to a particular category.
func (s *Store) GetProductsByCategory(ctx context.Context, category string) ([]Product, error) {
	query := `
		SELECT id, title, description, price, category, image, count, seller 
		FROM products WHERE category = ?
	`
	return s.getProducts(ctx, query, category)
}

// GetProductByID queries DB and returns a single product if found.
func (s *Store) GetProductByID(ctx context.Context, id int64) (*Product, error) {
	query := "SELECT * FROM products where id = ?"
	row := s.db.QueryRowContext(ctx, query, id)
	var p Product
	if err := row.Scan(
		&p.ID,
		&p.Title,
		&p.Description,
		&p.Price,
		&p.Category,
		&p.Image,
		&p.StockCount,
		&p.SellerID,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

// CreateProduct inserts a given product into DB, raises an error if ID is set.
func (s *Store) CreateProduct(ctx context.Context, p *Product) error {
	if p.ID != 0 {
		return fmt.Errorf("product ID is not empty")
	}

	if err := p.Validate(); err != nil {
		return fmt.Errorf("create product validation failed: %w", err)
	}

	// Ensure seller ID is valid
	_, err := s.GetUserByID(ctx, p.SellerID)
	if err != nil {
		return fmt.Errorf("create product failed (seller not found): %w", err)
	}

	query := `
		INSERT INTO products (
			title, description, price, category, image, stockcount, seller
		) VALUES(?, ?, ?, ?, ?, ?, ?)
	`
	res, err := s.db.ExecContext(ctx, query, p.Title, p.Description, p.Price, p.Category,
		p.Image, p.StockCount, p.SellerID)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}

	p.ID = id
	return nil
}

// UpdateProduct updates a given product, it raises an error if product.ID is not set.
func (s *Store) UpdateProduct(ctx context.Context, p *Product) error {
	if p.ID == 0 {
		return fmt.Errorf("product ID is missing")
	}

	if err := p.Validate(); err != nil {
		return fmt.Errorf("update product validation failed: %w", err)
	}

	query := `
		UPDATE products 
		SET 
			title = ?, 
			description = ?, 
			price = ?, 
			category = ?, 
			image = ?, 
			stockcount = ?,
			seller = ?
		WHERE id = ?
	`
	_, err := s.db.ExecContext(ctx, query, p.Title, p.Description, p.Price,
		p.Category, p.Image, p.StockCount, p.SellerID, p.ID)
	if err != nil {
		return err
	}

	return nil
}

// DeleteProduct deletes a given product by ID.
func (s *Store) DeleteProduct(ctx context.Context, pid int64) error {
	query := "DELETE FROM products where id = ?"
	_, err := s.db.ExecContext(ctx, query, pid)
	if err != nil {
		return err
	}
	return nil
}

// initProductsTable initializes 'products' table if it doesn't already exist.
func (s *Store) initProductsTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			price REAL NOT NULL,
			category TEXT NOT NULL,
			image TEXT NOT NULL DEFAULT '',
			stockcount REAL NOT NULL DEFAULT 1,
			seller INTEGER NOT NULL REFERENCES users(id)
		)
	`

	_, err := s.db.ExecContext(ctx, query)
	if err != nil {
		return err
	}

	return nil
}
