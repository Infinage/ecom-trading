package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/infinage/ecom-trading/internal/models"
	"github.com/starfederation/datastar-go/datastar"
)

// handleCartPage redirects user back to login if not logged in (checked via
// http cookie 'session_token' being set) otherwise returns user's cart as markup.
func (app *App) handleCartPage(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(userIDKey).(int64)

	cart, err := app.st.GetCart(r.Context(), uid)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to fetch user cart: %v", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	// If any qty exceeds stock count, disable checkout button
	var stockOk bool = true
	for _, item := range cart {
		if item.Quantity > item.StockCount {
			stockOk = false
		}
	}

	templData := map[string]any{"Cart": cart, "StockOk": stockOk}
	app.render("Cart", templData, w, r)
}

// handleAPIUpdateCart is used to add / remove an item from user's cart.
//   - payload: { pid: 1, action: 'add/remove', refreshTable: true/false }.
//   - user is picked from the http cookie.
func (app *App) handleAPIUpdateCart(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(userIDKey).(int64)

	data := struct {
		ProductID    int64  `json:"pid"`
		Action       string `json:"action"`
		RefreshTable bool   `json:"refreshTable"`
	}{}

	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&data); err != nil {
		errMsg := fmt.Sprintf("Failed to parse body: %v", err)
		http.Error(w, errMsg, http.StatusBadRequest)
		return
	}

	var err error
	switch data.Action {
	case "add":
		_, err = app.st.AddToCart(r.Context(), uid, data.ProductID)
	case "remove":
		_, err = app.st.RemoveFromCart(r.Context(), uid, data.ProductID)
	default:
		http.Error(w, "Unknown action: "+data.Action, http.StatusBadRequest)
		return
	}

	if err != nil {
		errMsg := fmt.Sprintf("cart update fail: %v", err)
		http.Error(w, errMsg, http.StatusBadRequest)
		return
	}

	meta, err := app.st.GetUserMetaByID(r.Context(), uid)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to pull meta: %v", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	// Update cart table
	var buffer strings.Builder
	if data.RefreshTable {
		cart, err := app.st.GetCart(r.Context(), uid)
		if err != nil {
			errMsg := fmt.Sprintf("Failed to update table: %v", err)
			http.Error(w, errMsg, http.StatusInternalServerError)
			return
		}

		// If any qty exceeds stock count, disable checkout button
		var stockOk bool = true
		for _, item := range cart {
			if item.Quantity > item.StockCount {
				stockOk = false
			}
		}

		templData := map[string]any{"Cart": cart, "StockOk": stockOk}
		if err = app.templ.ExecuteTemplate(&buffer, "Cart", templData); err != nil {
			errMsg := fmt.Sprintf("Failed to execute template: %v", err)
			http.Error(w, errMsg, http.StatusInternalServerError)
			return
		}
	}

	sse := datastar.NewSSE(w, r)
	signals := fmt.Sprintf("{user: {cart: %d}}", meta.Cart)
	sse.PatchSignals([]byte(signals))
	sse.PatchElements(buffer.String())
}

// handleShippingPage returns a static page to gather some dummy details from user.
func (app *App) handleShippingPage(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(userIDKey).(int64)
	user, err := app.st.GetUserByID(r.Context(), uid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data := map[string]any{"User": user, "MinExpiry": time.Now().Format("2006-01")}
	app.render("Shipping", data, w, r)
}

// handleAPICheckout flushes user's cart and updates the seller's inventory.
func (app *App) handleAPICheckout(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(userIDKey).(int64)
	cartItems, err := app.st.CreateOrder(r.Context(), uid)
	if err != nil {
		sse := datastar.NewSSE(w, r)
		signals := fmt.Sprintf("{_shipping: {errors: %q}}", err)
		sse.PatchSignals([]byte(signals))
		return
	}

	// Summary needs total price details
	var total models.ProductWithQuantity
	total.Title, total.Quantity = "Total", 0
	for _, item := range cartItems {
		total.Total += item.Total
		total.Quantity += item.Quantity
	}
	total.Total = float32(math.Round(float64(total.Total*100))) / 100

	cartItems = append(cartItems, total)
	app.render("OrderSummary", cartItems, w, r)
}
