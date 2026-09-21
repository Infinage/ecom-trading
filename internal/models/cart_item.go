package models

import (
	"fmt"
)

type CartItem struct {
	UserID    int64
	ProductID int64
	Quantity  uint
}

func NewCartItem(uid, pid int64, qty uint) (*CartItem, error) {
	if uid == 0 || pid == 0 {
		return nil, fmt.Errorf("missing user / product ID")
	}

	if qty <= 0 {
		return nil, fmt.Errorf("quantity must be greater than 0")
	}

	return &CartItem{UserID: uid, ProductID: pid, Quantity: qty}, nil
}
