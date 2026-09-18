package handlers

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/infinage/ecom-trading/internal/models"
)

type App struct {
	assets embed.FS
	templ  *template.Template
	st     *models.Store
}

// NewApp intializes the ecom-trading app, setting up DB, seeding it 
// when requested, initializing the templates, etc.
func NewApp(dbpath string, assets embed.FS, seedDB bool) (*App, error) {
	st, err := models.NewStore(dbpath)
	if err != nil {
		return nil, fmt.Errorf("db load fail: %w", err)
	}

	if seedDB {
		SeedDB(context.Background(), st)
	}

	// Enable access to defined helpers
	templ := template.New("").Funcs(templateHelpers)

	// Parse from embed store
	templ, err = templ.ParseFS(assets, "assets/html/*")
	if err != nil {
		return nil, fmt.Errorf("template parse fail: %w", err)
	}

	app := &App{assets: assets, st: st, templ: templ}
	return app, nil
}

// Routes configures a set of routes for the http server to use.
func (app *App) Routes() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", app.handlerAPIHome(true))
	mux.HandleFunc("GET /products/", app.handlerAPIHome(false))
	mux.HandleFunc("GET /product/{id}/", app.handleAPIProduct)
	mux.HandleFunc("GET /contact/", app.handleAPIContact)
	mux.Handle("GET /assets/", http.FileServerFS(app.assets))
	return mux
}

func (app *App) render(fragment string, w http.ResponseWriter) {
	data := map[string]any{"Content": template.HTML(fragment)}
	err := app.templ.ExecuteTemplate(w, "index.html", data)
	if err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}
}

func (app *App) handlerAPIHome(showHero bool) func(w http.ResponseWriter, r *http.Request)  {
	return func(w http.ResponseWriter, r *http.Request) {
		products, err := app.st.GetAllProducts(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Get all the unique categories
		categorySt := make(map[string]struct{})
		var categories []string
		for _, p := range products {
			if _, ok := categorySt[string(p.Category)]; !ok {
				categorySt[string(p.Category)] = struct{}{}
				categories = append(categories, string(p.Category))
			}
		}
		
		// Check if any query params have been set
		category := r.URL.Query().Get("category")

		data := map[string]any {
			"Products": products, 
			"Categories": categories,
			"ShowHero": showHero,
			"Category": category,
		}

		// Build the home template string into buffer 
		var buffer strings.Builder
		err = app.templ.ExecuteTemplate(&buffer, "Home", data)
		if err != nil {
			errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
			http.Error(w, errMsg, http.StatusInternalServerError)
			return
		}

		// Render the fragment
		app.render(buffer.String(), w)
	}
}

func (app *App) handleAPIContact(w http.ResponseWriter, r *http.Request) {
	var buffer strings.Builder	
	err := app.templ.ExecuteTemplate(&buffer, "Contact", nil)
	if err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	// Render the fragment
	app.render(buffer.String(), w)
}

func (app *App) handleAPIProduct(w http.ResponseWriter, r *http.Request) {
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

	app.render(buffer.String(), w)
}
