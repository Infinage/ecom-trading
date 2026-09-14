package models

import (
	"fmt"
	"regexp"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

var emailRegex = regexp.MustCompile(`^\S+@\S+\.\S+$`)

type User struct {
	ID       int64
	Name     string
	Email    string
	password string
	Address  string
}

// validatePassword ensures the following rules:
//   - Length between [6, 16]
//   - Atleast one letter, number & special character
func validatePassword(password string) error {
	if n := len(password); n < 6 || n > 16 {
		return fmt.Errorf("password length must be between 6 and 16")
	}

	var hasLetter, hasDigit, hasSpecial bool

	for _, r := range password {
		switch {
		case unicode.IsLetter(r):
			hasLetter = true
		case unicode.IsDigit(r):
			hasDigit = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		}
	}

	if !hasLetter || !hasDigit || !hasSpecial {
		const errMsg = "password must contain at least one letter, number and special character"
		return fmt.Errorf(errMsg)
	}

	return nil
}

// NewUser creates a new user and auto hashes the password. ID will
// be set only during DB write.
func NewUser(name, email, password, address string) (*User, error) {
	u := User{Name: name, Email: email, Address: address}
	if u.Name == "" || password == "" {
		return nil, fmt.Errorf("username or password not set")
	}

	if !emailRegex.MatchString(u.Email) {
		return nil, fmt.Errorf("invalid email: %q", u.Email)
	}

	if err := u.SetPassword(password); err != nil {
		return nil, err
	}

	return &u, nil
}

// ComparePassword compares the input password against the hashed password from struct.
func (u *User) ComparePassword(raw string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.password), []byte(raw))
	return err == nil
}

// SetPassword takes in a raw password string, runs validation rules and encrypts it.
func (u *User) SetPassword(password string) error {
	if err := validatePassword(password); err != nil {
		return fmt.Errorf("password validation fail: %w", err)
	}

	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("password hashing failed: %w", err)
	}

	u.password = string(hashedPwd)
	return nil
}

// Validate checks for presence of mandatory fields.
func (u *User) Validate() error {
	if u.Name == "" || u.password == "" {
		return fmt.Errorf("username or password not set")
	}

	if !emailRegex.MatchString(u.Email) {
		return fmt.Errorf("invalid email: %q", u.Email)
	}

	return nil
}
