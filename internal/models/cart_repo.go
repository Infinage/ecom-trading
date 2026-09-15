package models

import (
	"context"
	"fmt"
)

// CreateOrder persists order for a single user, returns an error if multiple
// users are provided.
func (st *Store) CreateOrder(ctx context.Context, cart []CartItem) error {
	tx, err := st.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to create txn: %v", err)
	}

	// On success we commit so this becomes a noop then
	defer tx.Rollback()

	var userid int64
	for _, item := range cart {
		if userid == 0 {
			userid = item.UserID
			row := tx.QueryRowContext(ctx, `SELECT id FROM users where id = ?`, userid)
			// Check that the user exists
			if err = row.Scan(); err != nil {
				return fmt.Errorf("user #%d not found", userid)	
			}
		} else if userid != item.UserID {
			return fmt.Errorf("cart contains orders from multiple users")
		}

		updateQuery := `
			UPDATE products SET stockcount = stockcount - ?
			WHERE id = ? and stockcount >= ?
		`
		res, err := tx.ExecContext(ctx, updateQuery, item.Quantity, item.ProductID)
		if err != nil {
			return fmt.Errorf("update stock count fail: %w", err)
		}

		updateCount, err := res.RowsAffected()
		if err != nil {
			return err
		} else if updateCount == 0 {
			return fmt.Errorf("product #%d is out of stock", item.ProductID)
		}

		// Log details to cart_item table
		insertCartItem := `INSERT INTO cart_item (userid, productid, quantity) VALUES(?, ?, ?)`
		_, err = tx.ExecContext(ctx, insertCartItem, item.UserID, item.ProductID, item.Quantity)
		if err != nil {
			return fmt.Errorf("persisting cart item fail: %w", err)
		}
	}

	return tx.Commit()
}

func (st *Store) initCartItemTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS cart_item (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userid INTEGER NOT NULL REFERENCES users(id),
			productid INTEGER NOT NULL REFERENCES products(id),
			quantity REAL NOT NULL DEFAULT 1
		)
	`

	_, err := st.db.ExecContext(ctx, query)
	if err != nil {
		return err
	}

	return nil
}
