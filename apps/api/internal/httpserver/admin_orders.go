package httpserver

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

const adminOrdersDefaultLimit = 50
const adminOrdersMaxLimit = 100

type adminOrderListResponse struct {
	Items []orderResponse `json:"items"`
}

type adminUpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

func (server *Server) handleAdminListOrders(writer http.ResponseWriter, request *http.Request) {
	if !requireAdmin(writer, request) {
		return
	}

	status := strings.TrimSpace(request.URL.Query().Get("status"))
	if status != "" && !isOrderStatus(status) {
		writeError(writer, http.StatusBadRequest, "invalid order status")
		return
	}

	limit, err := parseAdminOrdersLimit(request.URL.Query().Get("limit"))
	if err != nil {
		writeError(writer, http.StatusBadRequest, "invalid limit")
		return
	}

	rows, err := server.db.QueryContext(
		request.Context(),
		`
			SELECT id
			FROM orders
			WHERE ($1 = '' OR status::text = $1)
			ORDER BY created_at DESC
			LIMIT $2
		`,
		status,
		limit,
	)
	if err != nil {
		writeInternalError(writer, "cannot load admin orders", err)
		return
	}
	defer rows.Close()

	orders := make([]orderResponse, 0)
	for rows.Next() {
		var orderID string
		if err := rows.Scan(&orderID); err != nil {
			writeInternalError(writer, "cannot read admin orders", err)
			return
		}

		order, err := server.loadOrder(request, orderID)
		if err != nil {
			writeInternalError(writer, "cannot load admin order detail", err)
			return
		}
		orders = append(orders, order)
	}
	if err := rows.Err(); err != nil {
		writeInternalError(writer, "cannot read admin orders", err)
		return
	}

	writeJSON(writer, http.StatusOK, adminOrderListResponse{Items: orders})
}

func (server *Server) handleAdminGetOrder(writer http.ResponseWriter, request *http.Request) {
	if !requireAdmin(writer, request) {
		return
	}

	order, err := server.loadOrder(request, request.PathValue("id"))
	if err != nil {
		notFoundOrError(writer, err)
		return
	}

	writeJSON(writer, http.StatusOK, order)
}

func (server *Server) handleAdminUpdateOrderStatus(writer http.ResponseWriter, request *http.Request) {
	if !requireAdmin(writer, request) {
		return
	}

	var payload adminUpdateOrderStatusRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid request body")
		return
	}

	nextStatus := strings.TrimSpace(payload.Status)
	if !isOrderStatus(nextStatus) {
		writeError(writer, http.StatusBadRequest, "invalid order status")
		return
	}

	orderID := request.PathValue("id")
	var currentStatus string
	err := server.db.QueryRowContext(
		request.Context(),
		"SELECT status::text FROM orders WHERE id = $1",
		orderID,
	).Scan(&currentStatus)
	if err != nil {
		notFoundOrError(writer, err)
		return
	}

	if !canTransitionOrderStatus(currentStatus, nextStatus) {
		writeError(writer, http.StatusBadRequest, "invalid status transition")
		return
	}

	_, err = server.db.ExecContext(
		request.Context(),
		`
			UPDATE orders
			SET status = $1,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $2
		`,
		nextStatus,
		orderID,
	)
	if err != nil {
		writeInternalError(writer, "cannot update order status", err)
		return
	}

	order, err := server.loadOrder(request, orderID)
	if err != nil {
		writeInternalError(writer, "cannot reload order", err)
		return
	}

	writeJSON(writer, http.StatusOK, order)
}

func requireAdmin(writer http.ResponseWriter, request *http.Request) bool {
	if _, err := verifyAdminRequest(request); err != nil {
		writeError(writer, http.StatusUnauthorized, "unauthorized")
		return false
	}

	return true
}

func parseAdminOrdersLimit(value string) (int, error) {
	if strings.TrimSpace(value) == "" {
		return adminOrdersDefaultLimit, nil
	}

	limit, err := strconv.Atoi(value)
	if err != nil || limit <= 0 {
		return 0, errors.New("invalid limit")
	}
	if limit > adminOrdersMaxLimit {
		return adminOrdersMaxLimit, nil
	}

	return limit, nil
}

func isOrderStatus(status string) bool {
	return status == "pending" ||
		status == "in_progress" ||
		status == "done" ||
		status == "cancelled"
}

func canTransitionOrderStatus(currentStatus string, nextStatus string) bool {
	if currentStatus == nextStatus {
		return true
	}

	switch currentStatus {
	case "pending":
		return nextStatus == "in_progress" || nextStatus == "cancelled"
	case "in_progress":
		return nextStatus == "done" || nextStatus == "cancelled"
	case "done", "cancelled":
		return false
	default:
		return false
	}
}
