package models

import (
	"fmt"
)

type CartItem struct {
	ID        int64
	UserID    int64
	ProductID int64
	Quantity  int
}

func NewCartItem(uid, pid int64, qty int) (*CartItem, error) {
	if uid == 0 || pid == 0 {
		return nil, fmt.Errorf("missing user / product ID")
	}

	if qty <= 0 {
		return nil, fmt.Errorf("quantity must be greater than 0")
	}

	return &CartItem{UserID: uid, ProductID: pid, Quantity: qty}, nil
}
