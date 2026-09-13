package models

import (
	"context"
	"database/sql"
	"fmt"
)

type Store struct {
	db *sql.DB
}

func NewStore(dbpath string) (*Store, error) {
	db, err := sql.Open("sqlite", dbpath)
	if err != nil {
		return nil, fmt.Errorf("failed to load db: %w", err)
	}

	return &Store{db: db}, nil
}

func (s *Store) Init(ctx context.Context) error {
	if err := s.initUsersTable(ctx); err != nil {
		return fmt.Errorf("failed to init 'users' table: %w", err)
	}

	if err := s.initProductsTable(ctx); err != nil {
		return fmt.Errorf("failed to init 'products' table: %w", err)
	}

	return nil
}
