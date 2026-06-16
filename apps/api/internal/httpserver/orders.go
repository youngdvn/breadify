package httpserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"breadify/apps/api/internal/id"
)

const deliveryShippingFee = 20000

type createOrderRequest struct {
	FulfillmentType string `json:"fulfillmentType"`
	PaymentMethod   string `json:"paymentMethod"`
	CustomerName    string `json:"customerName"`
	Phone           string `json:"phone"`
	Address         string `json:"address"`
	Note            string `json:"note"`
}

type orderItemResponse struct {
	ID           string  `json:"id"`
	MenuItemID   string  `json:"menuItemId"`
	NameSnapshot string  `json:"nameSnapshot"`
	UnitPrice    int     `json:"unitPrice"`
	Quantity     int     `json:"quantity"`
	Note         *string `json:"note,omitempty"`
	LineTotal    int     `json:"lineTotal"`
}

type orderResponse struct {
	ID               string              `json:"id"`
	ShortID          string              `json:"shortId"`
	Status           string              `json:"status"`
	FulfillmentType  string              `json:"fulfillmentType"`
	PaymentMethod    string              `json:"paymentMethod"`
	PaymentStatus    string              `json:"paymentStatus"`
	CreatedAt        time.Time           `json:"createdAt"`
	CustomerName     *string             `json:"customerName,omitempty"`
	Phone            *string             `json:"phone,omitempty"`
	Address          *string             `json:"address,omitempty"`
	Note             *string             `json:"note,omitempty"`
	Subtotal         int                 `json:"subtotal"`
	ShippingFee      int                 `json:"shippingFee"`
	Discount         int                 `json:"discount"`
	TotalPrice       int                 `json:"totalPrice"`
	PaymentQRCodeURL *string             `json:"paymentQrCodeUrl,omitempty"`
	Items            []orderItemResponse `json:"items"`
}

func (server *Server) handleCreateOrder(writer http.ResponseWriter, request *http.Request) {
	sessionID, err := server.getCartSessionID(request)
	if isMissingCartSession(err) {
		writeError(writer, http.StatusBadRequest, "cart is empty")
		return
	}
	if err != nil {
		writeError(writer, http.StatusInternalServerError, "cannot load cart")
		return
	}

	var payload createOrderRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid request body")
		return
	}

	payload.normalize()
	if err := payload.validate(); err != nil {
		writeError(writer, http.StatusBadRequest, err.Error())
		return
	}

	order, err := server.createOrderFromCart(request, sessionID, payload)
	if err != nil {
		if errors.Is(err, errEmptyCart) {
			writeError(writer, http.StatusBadRequest, "cart is empty")
			return
		}
		writeError(writer, http.StatusInternalServerError, "cannot create order")
		return
	}

	clearCartSessionCookie(writer)
	writeJSON(writer, http.StatusCreated, order)
}

func (server *Server) handleGetOrder(writer http.ResponseWriter, request *http.Request) {
	order, err := server.loadOrder(request, request.PathValue("id"))
	if err != nil {
		notFoundOrError(writer, err)
		return
	}

	writeJSON(writer, http.StatusOK, order)
}

func (payload *createOrderRequest) normalize() {
	payload.FulfillmentType = strings.TrimSpace(payload.FulfillmentType)
	payload.PaymentMethod = strings.TrimSpace(payload.PaymentMethod)
	payload.CustomerName = strings.TrimSpace(payload.CustomerName)
	payload.Phone = strings.TrimSpace(payload.Phone)
	payload.Address = strings.TrimSpace(payload.Address)
	payload.Note = strings.TrimSpace(payload.Note)
}

func (payload createOrderRequest) validate() error {
	if payload.FulfillmentType != "pickup" && payload.FulfillmentType != "delivery" {
		return errors.New("invalid fulfillment type")
	}
	if payload.PaymentMethod != "cash" && payload.PaymentMethod != "vietqr" {
		return errors.New("invalid payment method")
	}
	if payload.FulfillmentType == "delivery" {
		if payload.CustomerName == "" {
			return errors.New("customer name is required for delivery")
		}
		if payload.Phone == "" {
			return errors.New("phone is required for delivery")
		}
		if payload.Address == "" {
			return errors.New("address is required for delivery")
		}
	}
	return nil
}

var errEmptyCart = errors.New("empty cart")

func (server *Server) createOrderFromCart(request *http.Request, sessionID string, payload createOrderRequest) (orderResponse, error) {
	tx, err := server.db.BeginTx(request.Context(), nil)
	if err != nil {
		return orderResponse{}, err
	}
	defer tx.Rollback()

	rows, err := tx.QueryContext(
		request.Context(),
		`
			SELECT mi.id, mi.name, mi.price, ci.quantity, ci.note
			FROM cart_items ci
			JOIN menu_items mi ON mi.id = ci.menu_item_id
			WHERE ci.cart_session_id = $1 AND mi.available = TRUE
			ORDER BY ci.created_at
		`,
		sessionID,
	)
	if err != nil {
		return orderResponse{}, err
	}
	defer rows.Close()

	type cartOrderItem struct {
		menuItemID string
		name       string
		unitPrice  int
		quantity   int
		note       sql.NullString
		lineTotal  int
	}

	items := make([]cartOrderItem, 0)
	subtotal := 0
	for rows.Next() {
		var item cartOrderItem
		if err := rows.Scan(&item.menuItemID, &item.name, &item.unitPrice, &item.quantity, &item.note); err != nil {
			return orderResponse{}, err
		}
		item.lineTotal = item.unitPrice * item.quantity
		subtotal += item.lineTotal
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return orderResponse{}, err
	}
	if len(items) == 0 {
		return orderResponse{}, errEmptyCart
	}

	orderID, err := id.NewUUIDV7()
	if err != nil {
		return orderResponse{}, err
	}

	shippingFee := 0
	if payload.FulfillmentType == "delivery" {
		shippingFee = deliveryShippingFee
	}
	totalPrice := subtotal + shippingFee

	_, err = tx.ExecContext(
		request.Context(),
		`
			INSERT INTO orders (
				id, fulfillment_type, payment_method, payment_status,
				customer_name, phone, address, note,
				subtotal, shipping_fee, discount, total_price
			)
			VALUES (
				$1, $2, $3, 'unpaid',
				NULLIF($4, ''), NULLIF($5, ''), NULLIF($6, ''), NULLIF($7, ''),
				$8, $9, 0, $10
			)
		`,
		orderID,
		payload.FulfillmentType,
		payload.PaymentMethod,
		payload.CustomerName,
		payload.Phone,
		payload.Address,
		payload.Note,
		subtotal,
		shippingFee,
		totalPrice,
	)
	if err != nil {
		return orderResponse{}, err
	}

	for _, item := range items {
		orderItemID, err := id.NewUUIDV7()
		if err != nil {
			return orderResponse{}, err
		}
		_, err = tx.ExecContext(
			request.Context(),
			`
				INSERT INTO order_items (
					id, order_id, menu_item_id, name_snapshot,
					unit_price, quantity, note, line_total
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			`,
			orderItemID,
			orderID,
			item.menuItemID,
			item.name,
			item.unitPrice,
			item.quantity,
			nullStringValue(item.note),
			item.lineTotal,
		)
		if err != nil {
			return orderResponse{}, err
		}
	}

	if _, err := tx.ExecContext(request.Context(), "DELETE FROM cart_sessions WHERE id = $1", sessionID); err != nil {
		return orderResponse{}, err
	}

	if err := tx.Commit(); err != nil {
		return orderResponse{}, err
	}

	return server.loadOrder(request, orderID)
}

func (server *Server) loadOrder(request *http.Request, orderID string) (orderResponse, error) {
	var order orderResponse
	var customerName sql.NullString
	var phone sql.NullString
	var address sql.NullString
	var note sql.NullString

	err := server.db.QueryRowContext(
		request.Context(),
		`
			SELECT
				id,
				status::text,
				fulfillment_type::text,
				payment_method::text,
				payment_status::text,
				created_at,
				customer_name,
				phone,
				address,
				note,
				subtotal,
				shipping_fee,
				discount,
				total_price
			FROM orders
			WHERE id = $1
		`,
		orderID,
	).Scan(
		&order.ID,
		&order.Status,
		&order.FulfillmentType,
		&order.PaymentMethod,
		&order.PaymentStatus,
		&order.CreatedAt,
		&customerName,
		&phone,
		&address,
		&note,
		&order.Subtotal,
		&order.ShippingFee,
		&order.Discount,
		&order.TotalPrice,
	)
	if err != nil {
		return orderResponse{}, err
	}

	order.ShortID = id.ShortID(order.ID)
	order.PaymentQRCodeURL = buildPaymentQRCodeURL(order.PaymentMethod, order.TotalPrice, order.ShortID)
	order.CustomerName = nullStringPtr(customerName)
	order.Phone = nullStringPtr(phone)
	order.Address = nullStringPtr(address)
	order.Note = nullStringPtr(note)
	order.Items = []orderItemResponse{}

	rows, err := server.db.QueryContext(
		request.Context(),
		`
			SELECT id, menu_item_id, name_snapshot, unit_price, quantity, note, line_total
			FROM order_items
			WHERE order_id = $1
			ORDER BY created_at
		`,
		orderID,
	)
	if err != nil {
		return orderResponse{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var item orderItemResponse
		var itemNote sql.NullString
		if err := rows.Scan(
			&item.ID,
			&item.MenuItemID,
			&item.NameSnapshot,
			&item.UnitPrice,
			&item.Quantity,
			&itemNote,
			&item.LineTotal,
		); err != nil {
			return orderResponse{}, err
		}
		item.Note = nullStringPtr(itemNote)
		order.Items = append(order.Items, item)
	}
	if err := rows.Err(); err != nil {
		return orderResponse{}, err
	}

	return order, nil
}

func buildPaymentQRCodeURL(paymentMethod string, totalPrice int, shortOrderID string) *string {
	if paymentMethod != "vietqr" {
		return nil
	}

	bankID := os.Getenv("STORE_BANK_ID")
	account := os.Getenv("STORE_BANK_ACCOUNT")
	owner := os.Getenv("STORE_BANK_OWNER")
	if bankID == "" || account == "" {
		return nil
	}

	values := url.Values{}
	values.Set("amount", strconv.Itoa(totalPrice))
	values.Set("addInfo", "Breadify "+shortOrderID)
	if owner != "" {
		values.Set("accountName", owner)
	}

	qrURL := "https://img.vietqr.io/image/" + url.PathEscape(bankID) + "-" + url.PathEscape(account) + "-compact2.png?" + values.Encode()
	return &qrURL
}

func nullStringValue(value sql.NullString) any {
	if !value.Valid {
		return nil
	}
	return value.String
}
