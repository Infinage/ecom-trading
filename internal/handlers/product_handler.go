package handlers

import (
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/infinage/ecom-trading/internal/models"
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

	var buffer strings.Builder
	data := map[string]any{"Product": p, "Samples": samples}
	err = app.templ.ExecuteTemplate(&buffer, "ProductPage", data)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to build ProductPage: %v", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	app.render(buffer.String(), w, r)
}
