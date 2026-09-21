package handlers

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"strings"

	"github.com/infinage/ecom-trading/internal/models"
)

type App struct {
	assets embed.FS
	templ  *template.Template
	st     *models.Store
	sst    *models.SessionStore
}

// ContextKey is used to strongly type 'UserIDKey'
type contextKey string

// userIDKey stores user id on authenticated requests into context.
const userIDKey contextKey = "UserID"

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

	app := &App{assets: assets, st: st, templ: templ, sst: models.NewSessionStore()}
	return app, nil
}

// Routes configures a set of routes for the http server to use.
func (app *App) Routes() *http.ServeMux {
	authMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := ""
			if cookie, err := r.Cookie("session_token"); err == nil {
				token = cookie.Value
			}

			sess, ok := app.sst.Get(token)
			if !ok {
				http.Redirect(w, r, "/login", http.StatusSeeOther)
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, sess.UserId)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /{$}", app.handlerHomePage(true))
	mux.Handle("GET /assets/", http.FileServerFS(app.assets))

	mux.HandleFunc("GET /products/", app.handlerHomePage(false))
	mux.HandleFunc("GET /product/{id}/", app.handleProductPage)
	mux.HandleFunc("GET /contact/", app.handleContactPage)

	mux.HandleFunc("GET /register/", app.handleRegisterPage)
	mux.HandleFunc("GET /api/register/validate", app.handleAPIRegisterValidate)
	mux.HandleFunc("POST /api/register", app.handleAPIRegister)

	mux.HandleFunc("GET /login", app.handleLoginPage)
	mux.HandleFunc("POST /api/login", app.handleAPILogin)
	mux.HandleFunc("POST /api/logout", app.handleAPILogout)

	mux.HandleFunc("GET /cart", authMiddleware(app.handleCartPage))
	mux.HandleFunc("POST /api/cart/update", authMiddleware(app.handleAPIUpdateCart))
	mux.HandleFunc("POST /api/cart/checkout", authMiddleware(app.handleAPICheckout))
	mux.HandleFunc("POST /shipping", authMiddleware(app.handleShippingPage))

	return mux
}

func (app *App) render(fragment string, w http.ResponseWriter, r *http.Request) {
	// Embed the content into base layout
	data := map[string]any{"Content": template.HTML(fragment)}

	// Extract cookie to populate the header details
	cookie, err := r.Cookie("session_token")
	if err == nil {
		if sess, ok := app.sst.Get(cookie.Value); ok {
			meta, err := app.st.GetUserMetaByID(r.Context(), sess.UserId)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Embed meta to be parsed by templates
			data["Meta"] = meta
		}
	}

	err = app.templ.ExecuteTemplate(w, "index.html", data)
	if err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}
}

func (app *App) handlerHomePage(showHero bool) func(w http.ResponseWriter, r *http.Request) {
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

		data := map[string]any{
			"Products":   products,
			"Categories": categories,
			"ShowHero":   showHero,
			"Category":   category,
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
		app.render(buffer.String(), w, r)
	}
}

func (app *App) handleContactPage(w http.ResponseWriter, r *http.Request) {
	var buffer strings.Builder
	err := app.templ.ExecuteTemplate(&buffer, "Contact", nil)
	if err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	// Render the fragment
	app.render(buffer.String(), w, r)
}
