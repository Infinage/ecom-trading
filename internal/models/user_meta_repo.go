package models

import (
	"context"
	"fmt"
)

type UserMeta struct {
	ID int64
	Name string
	Offering int
	Cart int
}

// GetUserMetaByID queries DB with user id and returns meta containing details 
// as username, count of listed products, count of cart items, etc.
func (s *Store) GetUserMetaByID(ctx context.Context, uid int64) (*UserMeta, error){
	u, err := s.GetUserByID(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("user #%d not found: %v", uid, err)
	}

	var offering, cart int

	row := s.db.QueryRowContext(ctx, `SELECT count(*) FROM products WHERE seller = ?`, uid)
	if err = row.Scan(&offering); err != nil {
		return nil, err
	}

	row = s.db.QueryRowContext(ctx, `SELECT count(*) FROM cart_items WHERE userid = ?`, uid)
	if err = row.Scan(&cart); err != nil {
		return nil, err
	}

	return &UserMeta{ID: uid, Name: u.Name, Offering: offering, Cart: cart}, nil
}
