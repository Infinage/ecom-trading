package handlers

import (
	"html/template"
	"strconv"
	"time"
)

var templateHelpers = template.FuncMap{
	"getCurrentYear": func() string {
		return strconv.Itoa(time.Now().Year())
	},
}
