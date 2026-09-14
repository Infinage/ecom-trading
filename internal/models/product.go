package models

import "fmt"

type ProductCategory string

const (
	CategoryApparel     ProductCategory = "Apparel"
	CategoryElectronics ProductCategory = "Electronics"
	CategoryFurniture   ProductCategory = "Furniture"
	CategoryUtensils    ProductCategory = "Utensils"
	CategoryOther       ProductCategory = "Other"
)

type Product struct {
	ID          int64
	Title       string
	Description string
	Price       float32
	Category    ProductCategory
	Image       string
	StockCount  uint
	SellerID    int64
}

// NewProduct performs validations and returns a new Product object
func NewProduct(title, desc string, price float32, category ProductCategory,
	imageUrl string, seller int64) (*Product, error) {

	p := Product{Title: title, Description: desc, Price: price,
		Category: category, Image: imageUrl, StockCount: 1,
		SellerID: seller}

	if err := p.Validate(); err != nil {
		return nil, err
	}

	return &p, nil
}

// Validate ensures mandatory fields are set with valid values.
func (p *Product) Validate() error {
	if p.Title == "" {
		return fmt.Errorf("title not set")
	}

	if p.Price <= 0 {
		return fmt.Errorf("price must be > 0")
	}

	if p.StockCount < 0 {
		return fmt.Errorf("stock count must be >= 0")
	}

	if p.SellerID == 0 {
		return fmt.Errorf("seller not set")
	}

	switch p.Category {
	case CategoryApparel, CategoryElectronics, CategoryFurniture,
		CategoryUtensils, CategoryOther:
	default:
		return fmt.Errorf("invalid product category %q", p.Category)
	}

	return nil
}
