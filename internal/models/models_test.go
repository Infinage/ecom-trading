package models

import (
	"fmt"
	"testing"
)

func checkErrMsg(t *testing.T, err error, expected string) {
	t.Helper()

	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	}

	if errMsg != expected {
		t.Errorf("want %q, got %q", expected, errMsg)
	}
}

func Test_NewProduct(t *testing.T) {
	type TC struct {
		name     string
		title    string
		desc     string
		price    float32
		category ProductCategory
		imageUrl string
		seller   int64
		errMsg   string
	}

	tests := []TC{
		{
			name:     "Valid",
			title:    "Title",
			desc:     "Desc",
			price:    1,
			category: CategoryApparel,
			imageUrl: "",
			seller:   1,
			errMsg:   "",
		},
		{
			name:     "Title missing",
			title:    "",
			desc:     "Desc",
			price:    1,
			category: CategoryApparel,
			imageUrl: "",
			seller:   1,
			errMsg:   "title not set",
		},
		{
			name:     "Price is zero",
			title:    "Title",
			desc:     "Desc",
			price:    0,
			category: CategoryApparel,
			imageUrl: "",
			seller:   1,
			errMsg:   "price must be > 0",
		},
		{
			name:     "Invalid category",
			title:    "Title",
			desc:     "Desc",
			price:    1,
			category: "",
			imageUrl: "",
			seller:   1,
			errMsg:   "invalid product category \"\"",
		},
		{
			name:     "Missing SellerID",
			title:    "Title",
			desc:     "Desc",
			price:    1,
			category: "",
			imageUrl: "",
			errMsg:   "seller not set",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := NewProduct(tt.title, tt.desc, tt.price, tt.category, tt.imageUrl, tt.seller)
			checkErrMsg(t, err, tt.errMsg)
		})
	}
}

func Test_NewCartItem(t *testing.T) {
	type TC struct {
		uid    int64
		pid    int64
		qty    int
		errMsg string
	}

	for _, tt := range []TC{
		{uid: 1, pid: 1, qty: 1, errMsg: ""},
		{uid: 0, pid: 1, qty: 1, errMsg: "missing user / product ID"},
		{uid: 1, pid: 0, qty: 1, errMsg: "missing user / product ID"},
		{uid: 1, pid: 1, qty: 0, errMsg: "quantity must be greater than 0"},
		{uid: 1, pid: 1, qty: -10, errMsg: "quantity must be greater than 0"},
	} {
		t.Run(fmt.Sprintf("%v,%v,%d", tt.uid, tt.pid, tt.qty), func(t *testing.T) {
			_, err := NewCartItem(tt.uid, tt.pid, tt.qty)
			checkErrMsg(t, err, tt.errMsg)
		})
	}
}

func Test_validatePassword(t *testing.T) {
	const (
		lenFail   = "password length must be between 6 and 16"
		alnumFail = "password must contain at least one letter, number and special character"
	)

	for _, tt := range []struct{ input, errMsg string }{
		{input: "ab123!", errMsg: ""},
		{input: "ab12!", errMsg: lenFail},
		{input: "abcdefghijk123!", errMsg: ""},
		{input: "abcdefghijkl1234!", errMsg: lenFail},
		{input: "abcdefghijkl123", errMsg: alnumFail},
		{input: "abcdefghijkl!", errMsg: alnumFail},
		{input: "12345678@", errMsg: alnumFail},
		{input: "@!#$@#$!!", errMsg: alnumFail},
	} {
		t.Run(tt.input, func(t *testing.T) {
			checkErrMsg(t, validatePassword(tt.input), tt.errMsg)
		})
	}
}

func Test_UserComparePassword(t *testing.T) {
	u, err := NewUser("John", "john@example.com", "abc123!", "123 Main St")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{name: "correct password", password: "abc123!", want: true},
		{name: "wrong password", password: "wrong123!", want: false},
		{name: "empty password", password: "", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := u.ComparePassword(tt.password); got != tt.want {
				t.Errorf("want %v, got %v", tt.want, got)
			}
		})
	}
}

func Test_UserSetPassword(t *testing.T) {
	u := &User{}
	t.Run("Setting valid password", func(t *testing.T) {
		if err := u.SetPassword("abc123!"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if u.password == "" {
			t.Fatal("expected password to be hashed")
		}

		if u.password == "abc123!" {
			t.Fatal("password should not be stored in plaintext")
		}

		if !u.ComparePassword("abc123!") {
			t.Error("password does not match after SetPassword")
		}

		if u.ComparePassword("wrong123!") {
			t.Error("wrong password should not match")
		}
	})

	u.password = ""
	t.Run("Setting invalid password", func(t *testing.T) {
		err := u.SetPassword("abcdef")
		if err == nil {
			t.Fatal("expected error, got nil")
		}

		want := "password validation fail: password must contain at least one letter, number and special character"
		if err.Error() != want {
			t.Errorf("want %q, got %q", want, err.Error())
		}

		if u.password != "" {
			t.Error("password should not be modified when validation fails")
		}
	})
}

func Test_NewUser(t *testing.T) {
	tests := []struct {
		name     string
		userName string
		email    string
		password string
		address  string
		errMsg   string
	}{
		{
			name:     "valid",
			userName: "John",
			email:    "john@example.com",
			password: "abc123!",
			address:  "123 Main St",
		},
		{
			name:     "missing username",
			userName: "",
			email:    "john@example.com",
			password: "abc123!",
			address:  "123 Main St",
			errMsg:   "username or password not set",
		},
		{
			name:     "invalid email",
			userName: "John",
			email:    "invalid-email",
			password: "abc123!",
			address:  "123 Main St",
			errMsg:   `invalid email: "invalid-email"`,
		},
		{
			name:     "invalid password",
			userName: "John",
			email:    "john@example.com",
			password: "abcdef",
			address:  "123 Main St",
			errMsg:   "password validation fail: password must contain at least one letter, number and special character",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := NewUser(
				tt.userName,
				tt.email,
				tt.password,
				tt.address,
			)

			checkErrMsg(t, err, tt.errMsg)

			if tt.errMsg != "" {
				if u != nil {
					t.Fatal("expected nil user on error")
				}
				return
			}

			if u == nil {
				t.Fatal("expected user, got nil")
			}

			if u.Name != tt.userName {
				t.Errorf("want name %q, got %q", tt.userName, u.Name)
			}

			if u.Email != tt.email {
				t.Errorf("want email %q, got %q", tt.email, u.Email)
			}

			if u.Address != tt.address {
				t.Errorf("want address %q, got %q", tt.address, u.Address)
			}

			if u.ID != 0 {
				t.Errorf("want ID 0, got %d", u.ID)
			}

			if u.password == "" {
				t.Error("expected password to be hashed")
			}

			if u.password == tt.password {
				t.Error("password should not be stored in plaintext")
			}

			if !u.ComparePassword(tt.password) {
				t.Error("hashed password does not match original password")
			}
		})
	}
}
