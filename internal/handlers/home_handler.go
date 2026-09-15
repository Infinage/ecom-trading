package handlers

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"time"

	"github.com/infinage/ecom-trading/internal/models"
)

type App struct {
	assets embed.FS
	templ  *template.Template
	st     *models.Store
}

var templateHelpers = template.FuncMap{
	"getCurrentYear": func() string { return fmt.Sprint(time.Now().Year()) },
}

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

func (app *App) handleHome(w http.ResponseWriter, r *http.Request) {
	app.templ.ExecuteTemplate(w, "home", nil)
}

func (app *App) Routes() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", app.handleHome)
	mux.Handle("GET /assets/", http.FileServerFS(app.assets))
	return mux
}
