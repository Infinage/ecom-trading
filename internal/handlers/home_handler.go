package handlers

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"log"
	"net/http"

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
	mux.HandleFunc("GET /", app.handleHome)
	mux.Handle("GET /assets/", http.FileServerFS(app.assets))
	return mux
}

func (app *App) handleHome(w http.ResponseWriter, r *http.Request) {
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

	data := map[string]any {"Products": products, "Categories": categories}
	err = app.templ.ExecuteTemplate(w, "index.html", data)
	if err != nil {
		log.Printf("Execute template fail: %v\n", err)
	}
}

