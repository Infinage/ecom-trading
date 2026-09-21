package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/infinage/ecom-trading/internal/models"
	"github.com/starfederation/datastar-go/datastar"
)

func (app *App) handleRegisterPage(w http.ResponseWriter, r *http.Request) {
	var buffer strings.Builder
	err := app.templ.ExecuteTemplate(&buffer, "Register", nil)
	if err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	app.render(buffer.String(), w, r)
}

func (app *App) handleLoginPage(w http.ResponseWriter, r *http.Request) {
	var buffer strings.Builder
	if err := app.templ.ExecuteTemplate(&buffer, "Login", nil); err != nil {
		errMsg := fmt.Sprintf("Execute template fail: %v\n", err)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return
	}

	app.render(buffer.String(), w, r)
}

func (app *App) handleAPIRegisterValidate(w http.ResponseWriter, r *http.Request) {
	input := struct {
		Register struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
			Address  string `json:"address"`
			Touched  struct {
				Name     bool `json:"name"`
				Email    bool `json:"email"`
				Password bool `json:"password"`
			} `json:"touched"`
		} `json:"register"`
	}{}

	output := struct {
		Register struct {
			FormErr  string `json:"_formError"`
			Disabled bool   `json:"_disabled"`
			Errors   struct {
				Name     string `json:"name"`
				Email    string `json:"email"`
				Password string `json:"password"`
			} `json:"_errors"`
		} `json:"register"`
	}{}

	raw := r.URL.Query().Get("datastar")
	if err := json.Unmarshal([]byte(raw), &input); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	form, formValRes := input.Register, &output.Register
	if form.Touched.Name && form.Name == "" {
		formValRes.Errors.Name = "* Required"
	}

	if form.Touched.Email {
		err := models.ValidateEmail(form.Email)
		if err != nil {
			formValRes.Errors.Email = "* " + err.Error()
		} else if _, err = app.st.GetUserByEmail(r.Context(), form.Email); err == nil {
			formValRes.Errors.Email = "* Email already exists"
		}
	}
	if form.Touched.Password {
		err := models.ValidatePassword(form.Password)
		if err != nil {
			formValRes.Errors.Password = "* " + err.Error()
		}
	}

	// Clickable only when all fields validate okay
	formValRes.Disabled =
		!form.Touched.Name || formValRes.Errors.Name != "" ||
			!form.Touched.Email || formValRes.Errors.Email != "" ||
			!form.Touched.Password || formValRes.Errors.Password != ""

	sse := datastar.NewSSE(w, r)
	sse.MarshalAndPatchSignals(output)
}

func (app *App) handleAPIRegister(w http.ResponseWriter, r *http.Request) {
	form := struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Address  string `json:"address"`
	}{}

	formOutput := struct {
		Register struct {
			Disabled bool   `json:"_disabled"`
			Message  string `json:"_formMessage"`
			Style    string `json:"_formMessageStyle"`
		} `json:"register"`
	}{}

	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&form); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sse := datastar.NewSSE(w, r)

	u, err := models.NewUser(form.Name, form.Email, form.Password, form.Address)
	if err != nil {
		formOutput.Register.Message = err.Error()
		formOutput.Register.Style = "text-red-600 font-medium"
		sse.MarshalAndPatchSignals(formOutput)
		return
	}

	if err = app.st.CreateUser(r.Context(), u); err != nil {
		formOutput.Register.Message = err.Error()
		formOutput.Register.Style = "text-red-600 font-medium"
		sse.MarshalAndPatchSignals(formOutput)
		return
	}

	formOutput.Register.Message = fmt.Sprintf("User #%d created, redirecting to login..", u.ID)
	formOutput.Register.Style = "text-emerald-600 font-medium"
	formOutput.Register.Disabled = true
	sse.MarshalAndPatchSignals(formOutput)
	sse.ExecuteScript(`setTimeout(() => { window.location.replace("/login"); }, 2000)`)
}

func (app *App) handleAPILogin(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	u, err := app.st.GetUserByEmail(r.Context(), r.FormValue("email"))
	if err != nil || !u.ComparePassword(r.FormValue("password")) {
		sse := datastar.NewSSE(w, r)
		signals := fmt.Sprintf(`{login: {error: "Email / Password incorrect"}}`)
		sse.PatchSignals([]byte(signals))
		return
	}

	// Create a new session and persist to app session store
	sess := app.sst.NewSession(u.ID)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sess.Token,
		Expires:  sess.Expiry,
		Path:     "/",
		HttpOnly: true,
	})

	sse := datastar.NewSSE(w, r)
	_ = sse.ExecuteScript("window.location.href = '/'")
}

func (app *App) handleAPILogout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie("session_token"); err == nil {
		app.sst.Delete(cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		Path:     "/",
		HttpOnly: true,
	})

	sse := datastar.NewSSE(w, r)
	sse.PatchSignals([]byte("{user: {name: '', id: 0, offering: 0, cart: 0}}"))
	sse.ExecuteScript("window.location = '/login'")
}
