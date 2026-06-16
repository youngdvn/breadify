package httpserver

import (
	"database/sql"
	"net/http"
)

type menuItemResponse struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Category    string  `json:"category"`
	Price       int     `json:"price"`
	ImageURL    *string `json:"imageUrl,omitempty"`
	Description *string `json:"description,omitempty"`
	Detail      *string `json:"detail,omitempty"`
	Available   bool    `json:"available"`
	SortOrder   int     `json:"sortOrder"`
}

func (server *Server) handleListMenu(writer http.ResponseWriter, request *http.Request) {
	category := request.URL.Query().Get("category")
	if category != "" && category != "banh_mi" && category != "do_uong" {
		writeError(writer, http.StatusBadRequest, "invalid category")
		return
	}

	rows, err := server.db.QueryContext(
		request.Context(),
		`
			SELECT id, name, slug, category::text, price, image_url, description, detail, available, sort_order
			FROM menu_items
			WHERE ($1 = '' OR category::text = $1)
			ORDER BY category, sort_order, name
		`,
		category,
	)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load menu")
		return
	}
	defer rows.Close()

	items := make([]menuItemResponse, 0)
	for rows.Next() {
		item, err := scanMenuItem(rows)
		if err != nil {
			writeError(writer, http.StatusInternalServerError, "cannot read menu")
			return
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot read menu")
		return
	}

	writeJSON(writer, http.StatusOK, map[string]any{"items": items})
}

func (server *Server) handleGetMenuItem(writer http.ResponseWriter, request *http.Request) {
	row := server.db.QueryRowContext(
		request.Context(),
		`
			SELECT id, name, slug, category::text, price, image_url, description, detail, available, sort_order
			FROM menu_items
			WHERE slug = $1
		`,
		request.PathValue("slug"),
	)

	item, err := scanMenuItem(row)
	if err != nil {
		notFoundOrError(writer, err)
		return
	}

	writeJSON(writer, http.StatusOK, item)
}

type menuItemScanner interface {
	Scan(dest ...any) error
}

func scanMenuItem(scanner menuItemScanner) (menuItemResponse, error) {
	var item menuItemResponse
	var imageURL sql.NullString
	var description sql.NullString
	var detail sql.NullString

	err := scanner.Scan(
		&item.ID,
		&item.Name,
		&item.Slug,
		&item.Category,
		&item.Price,
		&imageURL,
		&description,
		&detail,
		&item.Available,
		&item.SortOrder,
	)
	if err != nil {
		return menuItemResponse{}, err
	}

	item.ImageURL = nullStringPtr(imageURL)
	item.Description = nullStringPtr(description)
	item.Detail = nullStringPtr(detail)

	return item, nil
}

func nullStringPtr(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return &value.String
}
