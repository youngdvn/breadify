package httpserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"breadify/apps/api/internal/id"
)

type cartItemResponse struct {
	ID          string  `json:"id"`
	MenuItemID  string  `json:"menuItemId"`
	Slug        string  `json:"slug"`
	Name        string  `json:"name"`
	Price       int     `json:"price"`
	Quantity    int     `json:"quantity"`
	Note        *string `json:"note,omitempty"`
	LineTotal   int     `json:"lineTotal"`
	Description *string `json:"description,omitempty"`
}

type cartResponse struct {
	Items       []cartItemResponse `json:"items"`
	Subtotal    int                `json:"subtotal"`
	ShippingFee int                `json:"shippingFee"`
	Discount    int                `json:"discount"`
	Total       int                `json:"total"`
}

type addCartItemRequest struct {
	MenuItemID string `json:"menuItemId"`
	Slug       string `json:"slug"`
	Quantity   int    `json:"quantity"`
	Note       string `json:"note"`
}

type updateCartItemRequest struct {
	Quantity int    `json:"quantity"`
	Note     string `json:"note"`
}

func (server *Server) handleGetCart(writer http.ResponseWriter, request *http.Request) {
	sessionID, err := server.getCartSessionID(request)
	if isMissingCartSession(err) {
		writeJSON(writer, http.StatusOK, emptyCartResponse())
		return
	}
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	cart, err := server.loadCart(request, sessionID)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	writeJSON(writer, http.StatusOK, cart)
}

func (server *Server) handleAddCartItem(writer http.ResponseWriter, request *http.Request) {
	var payload addCartItemRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid request body")
		return
	}

	if payload.Quantity <= 0 || payload.Quantity > 20 {
		writeError(writer, http.StatusBadRequest, "quantity must be between 1 and 20")
		return
	}

	sessionID, err := server.getOrCreateCartSessionID(writer, request)
	if err != nil {
		writeInternalError(writer, "cannot create cart session", err)
		return
	}

	menuItemID, err := server.resolveAvailableMenuItemID(request, payload)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(writer, http.StatusBadRequest, "menu item is unavailable")
			return
		}
		writeInternalError(writer, "cannot add cart item", err)
		return
	}

	cartItemID, err := id.NewUUIDV7()
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot create cart item")
		return
	}

	note := strings.TrimSpace(payload.Note)
	_, err = server.db.ExecContext(
		request.Context(),
		`
			INSERT INTO cart_items (id, cart_session_id, menu_item_id, quantity, note)
			VALUES ($1, $2, $3, $4, NULLIF($5, ''))
			ON CONFLICT (cart_session_id, menu_item_id)
			DO UPDATE SET
				quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, 20),
				note = COALESCE(EXCLUDED.note, cart_items.note),
				updated_at = CURRENT_TIMESTAMP
		`,
		cartItemID,
		sessionID,
		menuItemID,
		payload.Quantity,
		note,
	)
	if err != nil {
		writeInternalError(writer, "cannot add cart item", err)
		return
	}

	cart, err := server.loadCart(request, sessionID)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	writeJSON(writer, http.StatusCreated, cart)
}

func (server *Server) handleClearCart(writer http.ResponseWriter, request *http.Request) {
	sessionID, err := server.getCartSessionID(request)
	if isMissingCartSession(err) {
		clearCartSessionCookie(writer)
		writeJSON(writer, http.StatusOK, emptyCartResponse())
		return
	}
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot clear cart")
		return
	}

	_, err = server.db.ExecContext(request.Context(), "DELETE FROM cart_sessions WHERE id = $1", sessionID)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot clear cart")
		return
	}

	clearCartSessionCookie(writer)
	writeJSON(writer, http.StatusOK, emptyCartResponse())
}

func (server *Server) handleUpdateCartItem(writer http.ResponseWriter, request *http.Request) {
	sessionID, err := server.getCartSessionID(request)
	if isMissingCartSession(err) {
		writeError(writer, http.StatusNotFound, "cart item not found")
		return
	}
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	var payload updateCartItemRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid request body")
		return
	}
	if payload.Quantity <= 0 || payload.Quantity > 20 {
		writeError(writer, http.StatusBadRequest, "quantity must be between 1 and 20")
		return
	}

	result, err := server.db.ExecContext(
		request.Context(),
		`
			UPDATE cart_items
			SET quantity = $1,
				note = NULLIF($2, ''),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $3 AND cart_session_id = $4
		`,
		payload.Quantity,
		strings.TrimSpace(payload.Note),
		request.PathValue("id"),
		sessionID,
	)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot update cart item")
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot update cart item")
		return
	}
	if rowsAffected == 0 {
		writeError(writer, http.StatusNotFound, "cart item not found")
		return
	}

	cart, err := server.loadCart(request, sessionID)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	writeJSON(writer, http.StatusOK, cart)
}

func (server *Server) handleDeleteCartItem(writer http.ResponseWriter, request *http.Request) {
	sessionID, err := server.getCartSessionID(request)
	if isMissingCartSession(err) {
		writeError(writer, http.StatusNotFound, "cart item not found")
		return
	}
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	result, err := server.db.ExecContext(
		request.Context(),
		`
			DELETE FROM cart_items
			WHERE id = $1 AND cart_session_id = $2
		`,
		request.PathValue("id"),
		sessionID,
	)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot delete cart item")
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot delete cart item")
		return
	}
	if rowsAffected == 0 {
		writeError(writer, http.StatusNotFound, "cart item not found")
		return
	}

	cart, err := server.loadCart(request, sessionID)
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	writeJSON(writer, http.StatusOK, cart)
}

func (server *Server) resolveAvailableMenuItemID(request *http.Request, payload addCartItemRequest) (string, error) {
	var menuItemID string
	if payload.MenuItemID != "" {
		err := server.db.QueryRowContext(
			request.Context(),
			`
				SELECT id
				FROM menu_items
				WHERE available = TRUE AND id = $1::uuid
				LIMIT 1
			`,
			payload.MenuItemID,
		).Scan(&menuItemID)
		return menuItemID, err
	}

	err := server.db.QueryRowContext(
		request.Context(),
		`
			SELECT id
			FROM menu_items
			WHERE available = TRUE AND slug = $1
			LIMIT 1
		`,
		payload.Slug,
	).Scan(&menuItemID)
	return menuItemID, err
}

func (server *Server) loadCart(request *http.Request, sessionID string) (cartResponse, error) {
	rows, err := server.db.QueryContext(
		request.Context(),
		`
			SELECT
				ci.id,
				mi.id,
				mi.slug,
				mi.name,
				mi.price,
				ci.quantity,
				ci.note,
				mi.price * ci.quantity AS line_total,
				mi.description
			FROM cart_items ci
			JOIN menu_items mi ON mi.id = ci.menu_item_id
			WHERE ci.cart_session_id = $1
			ORDER BY ci.created_at
		`,
		sessionID,
	)
	if err != nil {
		return cartResponse{}, err
	}
	defer rows.Close()

	cart := emptyCartResponse()
	for rows.Next() {
		var item cartItemResponse
		var note sql.NullString
		var description sql.NullString
		if err := rows.Scan(
			&item.ID,
			&item.MenuItemID,
			&item.Slug,
			&item.Name,
			&item.Price,
			&item.Quantity,
			&note,
			&item.LineTotal,
			&description,
		); err != nil {
			return cartResponse{}, err
		}
		item.Note = nullStringPtr(note)
		item.Description = nullStringPtr(description)
		cart.Subtotal += item.LineTotal
		cart.Items = append(cart.Items, item)
	}
	if err := rows.Err(); err != nil {
		return cartResponse{}, err
	}
	cart.Total = cart.Subtotal + cart.ShippingFee - cart.Discount

	return cart, nil
}

func emptyCartResponse() cartResponse {
	return cartResponse{
		Items:       []cartItemResponse{},
		Subtotal:    0,
		ShippingFee: 0,
		Discount:    0,
		Total:       0,
	}
}
