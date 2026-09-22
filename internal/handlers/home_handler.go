package handlers

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
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
				targetPath := r.URL.RequestURI()
				if strings.HasPrefix(r.URL.Path, "/api") || r.Method != "GET" {
					if referer := r.Referer(); referer != "" {
						if u, err := url.ParseRequestURI(referer); err == nil {
							targetPath = u.RequestURI()
						}
					}
				}

				target := url.QueryEscape(targetPath)
				http.Redirect(w, r, "/login?next="+target, http.StatusSeeOther)
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

	mux.HandleFunc("GET /merchant/{id}/", app.handleMerchantPage)
	mux.HandleFunc("POST /api/product", authMiddleware(app.handleAPIEditProduct))
	mux.HandleFunc("PUT /api/product", authMiddleware(app.handleAPIUpdateProduct))
	mux.HandleFunc("DELETE /api/product/{id}", authMiddleware(app.handleAPIDeleteProduct))

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
	mux.HandleFunc("GET /shipping", authMiddleware(app.handleShippingPage))

	return mux
}

// render builds an inner template with given data to a temporary buffer. It later
// writes this data into our 'index.html' base layout. If logged in, header is populated
// with user meta such as name, offerings, cart.
func (app *App) render(templName string, templData any, w http.ResponseWriter, r *http.Request) {
	// Build the inner template into a buffer
	var buffer strings.Builder
	err := app.templ.ExecuteTemplate(&buffer, templName, templData)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to build %s: %v", templName, err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	// Embed the inner content into base layout
	rootData := map[string]any{"Content": template.HTML(buffer.String())}

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
			rootData["Meta"] = meta
		}
	}

	err = app.templ.ExecuteTemplate(w, "index.html", rootData)
	if err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}
}

func (app *App) handlerHomePage(showHero bool) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		products, err := app.st.GetAllValidProducts(r.Context())
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

		// Render the page
		app.render("Home", data, w, r)
	}
}

func (app *App) handleContactPage(w http.ResponseWriter, r *http.Request) {
	app.render("Contact", nil, w, r)
}
