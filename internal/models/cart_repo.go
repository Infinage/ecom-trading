package models

import (
	"context"
	"fmt"
	"math"
)

type ProductWithQuantity struct {
	Product
	Quantity uint
	Total    float32
}

// GetCart returns a list of cart_items for a particular user.
func (st *Store) GetCart(ctx context.Context, uid int64) ([]ProductWithQuantity, error) {
	query := `
		SELECT 
			p.id, 
			p.title, 
			p.description, 
			p.price, 
			p.category, 
			p.image, 
			p.stockcount, 
			p.seller, 
			c.quantity 
		FROM products p
		JOIN cart_items c ON c.productid = p.id
		WHERE c.userid = ?
	`

	rows, err := st.db.QueryContext(ctx, query, uid)
	if err != nil {
		return nil, fmt.Errorf("failed to read user cart: %v", err)
	}
	defer rows.Close()

	var products []ProductWithQuantity
	for rows.Next() {
		var item ProductWithQuantity
		err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.Description,
			&item.Price,
			&item.Category,
			&item.Image,
			&item.StockCount,
			&item.SellerID,
			&item.Quantity,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch item: %v", err)
		}

		total := float64(item.Quantity) * float64(item.Price)
		item.Total = float32(math.Round(total*100)) / 100
		products = append(products, item)
	}

	return products, nil
}

// AddToCart adds one unit of given product to user's cart and returns CartItem
// with updated count.
func (st *Store) AddToCart(ctx context.Context, uid, pid int64) (*CartItem, error) {
	query := `
		INSERT INTO cart_items (userid, productid, quantity)
		VALUES (?, ?, 1) 
		ON CONFLICT(userid, productid)
		DO UPDATE SET quantity = cart_items.quantity + 1
		RETURNING userid, productid, quantity
	`

	var cart CartItem

	row := st.db.QueryRowContext(ctx, query, uid, pid)
	if err := row.Scan(&cart.UserID, &cart.ProductID, &cart.Quantity); err != nil {
		return nil, fmt.Errorf("failed to add to cart: %v", err)
	}

	return &cart, nil
}

// RemoveFromCart subtracts one unit of given product from user's cart and returns CartItem
// with updated count. It deletes entry from DB if quantity reaches 0.
func (st *Store) RemoveFromCart(ctx context.Context, uid, pid int64) (*CartItem, error) {
	query := `
		UPDATE cart_items SET quantity = max(cart_items.quantity - 1, 0)
		WHERE userid = ? and productid = ?
		RETURNING userid, productid, quantity
	`

	var cart CartItem

	row := st.db.QueryRowContext(ctx, query, uid, pid)
	if err := row.Scan(&cart.UserID, &cart.ProductID, &cart.Quantity); err != nil {
		return nil, fmt.Errorf("failed to remove from cart: %v", err)
	}

	return &cart, nil
}

// CreateOrder books all active items on user's cart and updates
// quantity as listed on the seller side.
func (st *Store) CreateOrder(ctx context.Context, uid int64) error {
	tx, err := st.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to create txn: %v", err)
	}

	// On success we commit so this becomes a noop then
	defer tx.Rollback()

	// Fetch all the cart items
	var cart []CartItem
	rows, err := tx.QueryContext(ctx, `SELECT * FROM cart_items WHERE userid = ?`, uid)
	if err != nil {
		return fmt.Errorf("failed to fetch cart: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item CartItem
		err = rows.Scan(&item.UserID, &item.ProductID, &item.Quantity)
		if err != nil {
			return fmt.Errorf("failed to fetch cart item: %v", err)
		}
		cart = append(cart, item)
	}

	if len(cart) == 0 {
		return fmt.Errorf("cart is empty")
	}

	// Update the product quantity based on the order
	for _, item := range cart {
		updateQuery := `
			UPDATE products 
			SET stockcount = stockcount - ?
			WHERE id = ? AND stockcount >= ?
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
	}

	// Delete the cart items for the user
	_, err = st.db.ExecContext(ctx, `DELETE FROM cart_items WHERE userid = ?`, uid)
	if err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}

	return tx.Commit()
}

func (st *Store) initCartItemTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS cart_items (
			userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			productid INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			quantity INTEGER NOT NULL DEFAULT 1,
			PRIMARY KEY (userid, productid)
		);

		CREATE TRIGGER IF NOT EXISTS remove_empty_cart_items
		AFTER UPDATE ON cart_items
		WHEN NEW.quantity <= 0
		BEGIN
			DELETE FROM cart_items WHERE userid = NEW.userid AND productid = NEW.productid;
		END;
	`

	_, err := st.db.ExecContext(ctx, query)
	if err != nil {
		return err
	}

	return nil
}
