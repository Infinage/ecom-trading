package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"slices"
	"strconv"

	"github.com/infinage/ecom-trading/internal/models"
	"github.com/starfederation/datastar-go/datastar"
)

func (app *App) handleProductPage(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		errMsg := fmt.Sprintf("Invalid ID passed: %v", err)
		http.Error(w, errMsg, http.StatusBadRequest)
		return
	}

	p, err := app.st.GetProductByID(r.Context(), id)
	if err != nil {
		errMsg := fmt.Sprintf("Could not retreive product: %v", err)
		http.Error(w, errMsg, http.StatusNotFound)
		return
	}

	// Samples to not show current item
	samples, err := app.st.GetProductsByCategory(r.Context(), string(p.Category))
	samples = slices.DeleteFunc(samples, func(p models.Product) bool { return p.ID == id })
	if len(samples) > 4 {
		samples = samples[:4]
	}

	data := map[string]any{"Product": p, "Samples": samples}
	app.render("ProductPage", data, w, r)
}

func (app *App) handleMerchantPage(w http.ResponseWriter, r *http.Request) {
	merchantID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	products, err := app.st.GetProductsBySeller(r.Context(), merchantID)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to get merchant details: %v", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	var Editable bool
	cookie, err := r.Cookie("session_token")
	if err == nil {
		if sess, ok := app.sst.Get(cookie.Value); ok {
			Editable = merchantID == sess.UserId
		}
	}

	data := map[string]any{"Offerings": products, "Editable": Editable}
	app.render("Merchant", data, w, r)
}

func (app *App) handleAPIDeleteProduct(w http.ResponseWriter, r *http.Request) {
	uid, _ := r.Context().Value(userIDKey).(int64)

	pid, err := strconv.ParseInt(r.PathValue("pid"), 10, 64)
	if err != nil {
		http.Error(w, "Invalid Product ID", http.StatusBadRequest)
		return
	}

	product, err := app.st.GetProductByID(r.Context(), pid)
	if err != nil {
		errMsg := fmt.Sprintf("Fetch product fail: %v", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	if product.SellerID != uid {
		http.Error(w, "Unauthorised", http.StatusUnauthorized)
		return
	}

	if err = app.st.DeleteProduct(r.Context(), pid); err != nil {
		http.Error(w, "Delete fail: "+err.Error(), http.StatusUnauthorized)
		return
	}

	sse := datastar.NewSSE(w, r)
	sse.RemoveElementByID(fmt.Sprintf("product-[%d]", pid))
}

func (app *App) handleAPIUpdateProduct(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Failed to parse: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Parse fields from inbound request
	uid, _ := r.Context().Value(userIDKey).(int64)
	pid, err := strconv.ParseInt(r.FormValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "Failed to parse 'id': "+err.Error(), http.StatusBadRequest)
		return
	}
	price, err := strconv.ParseFloat(r.FormValue("price"), 32)
	if err != nil {
		http.Error(w, "Failed to parse 'price': "+err.Error(), http.StatusBadRequest)
		return
	}
	stockcount, err := strconv.ParseUint(r.FormValue("stockcount"), 10, 64)
	if err != nil {
		http.Error(w, "Failed to parse 'stockcount': "+err.Error(), http.StatusBadRequest)
		return
	}

	// Create a new product with parsed fields, auto validates
	var product *models.Product
	if product, err = models.NewProduct(
		r.FormValue("title"),
		r.FormValue("description"),
		float32(price), uint(stockcount),
		models.ProductCategory(r.FormValue("category")),
		r.FormValue("image"),
		uid,
	); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if pid == 0 {
		err = app.st.CreateProduct(r.Context(), product)
	} else {
		product.ID = pid
		err = app.st.UpdateProduct(r.Context(), product)
	}

	sse := datastar.NewSSE(w, r)
	if err != nil {
		signals := fmt.Sprintf("{_product: {errors: %q}}", err.Error())
		sse.PatchSignals([]byte(signals))
	}

	sse.Redirectf("/product/%d", product.ID)
}

func (app *App) handleAPIEditProduct(w http.ResponseWriter, r *http.Request) {
	// Extract the optional PID from request body
	payload := struct {
		PID int64 `json:"pid"`
	}{}
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&payload); err != nil && errors.Is(err, io.EOF) {
		http.Error(w, "Invalid payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	// If PID is present - populate the product contents, provided user has access
	product := &models.Product{} // Default init (prevent nil ptr issues)
	if payload.PID != 0 {
		var err error
		product, err = app.st.GetProductByID(r.Context(), payload.PID)
		if err != nil {
			errMsg := fmt.Sprintf("Failed to fetch product #%d: %v", payload.PID, err)
			http.Error(w, errMsg, http.StatusInternalServerError)
			return
		} else if product.SellerID != r.Context().Value(userIDKey).(int64) {
			http.Error(w, "Not Authorized", http.StatusUnauthorized)
			return
		}
	}

	data := map[string]any{
		"New":     payload.PID == 0,
		"Product": product,
		"Categories": []models.ProductCategory{
			models.CategoryApparel,
			models.CategoryElectronics,
			models.CategoryFurniture,
			models.CategoryUtensils,
			models.CategoryOther,
		},
	}

	app.render("EditProduct", data, w, r)
}
