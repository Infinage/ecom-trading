package models

import (
	"context"
	"database/sql"
	"fmt"
)

// getUser is a helper function to reduce some boiler plate code.
func (s *Store) getUser(ctx context.Context, query string, args ...any) (*User, error) {
	var u User
	var passwordHash string

	row := s.db.QueryRowContext(ctx, query, args...)
	err := row.Scan(&u.ID, &u.Name, &u.Email, &passwordHash, &u.Address)
	if err != nil {
		return nil, err
	}

	u.password = passwordHash
	return &u, nil
}

// GetUserByID returns a single user by ID if found.
func (s *Store) GetUserByID(ctx context.Context, id int64) (*User, error) {
	query := "SELECT id, name, email, password, address FROM users WHERE id = ?"
	return s.getUser(ctx, query, id)
}

// FindUserByEmail returns a single user by email if found.
func (s *Store) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	query := "SELECT id, name, email, password, address FROM users WHERE email = ?"
	return s.getUser(ctx, query, email)
}

// CreateUser persists a new user to DB and updates the object's ID.
func (s *Store) CreateUser(ctx context.Context, u *User) error {
	if err := u.Validate(); err != nil {
		return fmt.Errorf("create user validation failed: %w", err)
	}

	var res sql.Result
	var err error

	switch u.ID {
	case 0:
		query := "INSERT INTO users (name, email, password, address) VALUES(?, ?, ?, ?)"
		res, err = s.db.ExecContext(ctx, query, u.Name, u.Email, u.password, u.Address)

	default:
		query := "INSERT INTO users (id, name, email, password, address) VALUES(?, ?, ?, ?, ?)"
		res, err = s.db.ExecContext(ctx, query, u.ID, u.Name, u.Email, u.password, u.Address)
	}

	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}

	u.ID = id
	return nil
}

// UpdateUser modifies an existing user in DB.
func (s *Store) UpdateUser(ctx context.Context, u *User) error {
	if u.ID == 0 {
		return fmt.Errorf("user ID is missing")
	}

	if err := u.Validate(); err != nil {
		return fmt.Errorf("update user validation failed: %w", err)
	}

	query := "UPDATE users SET name = ?, email = ?, password = ?, address = ? WHERE id = ?"
	_, err := s.db.ExecContext(ctx, query, u.Name, u.Email, u.password, u.Address, u.ID)
	if err != nil {
		return err
	}

	return nil
}

// initUsersTable initializes 'users' table if it doesn't already exist.
func (s *Store) initUsersTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			address TEXT NOT NULL DEFAULT ''
		)
	`

	_, err := s.db.ExecContext(ctx, query)
	if err != nil {
		return err
	}

	return nil
}
