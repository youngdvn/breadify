package httpserver

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"time"
)

type Server struct {
	db *sql.DB
}

func New(database *sql.DB) *Server {
	return &Server{db: database}
}

func (server *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", server.handleHealth)
	mux.HandleFunc("GET /readyz", server.handleReady)
	mux.HandleFunc("GET /api/menu", server.handleListMenu)
	mux.HandleFunc("GET /api/menu/{slug}", server.handleGetMenuItem)
	mux.HandleFunc("GET /api/cart", server.handleGetCart)
	mux.HandleFunc("POST /api/cart/items", server.handleAddCartItem)
	mux.HandleFunc("PATCH /api/cart/items/{id}", server.handleUpdateCartItem)
	mux.HandleFunc("DELETE /api/cart/items/{id}", server.handleDeleteCartItem)
	mux.HandleFunc("DELETE /api/cart", server.handleClearCart)
	mux.HandleFunc("POST /api/orders", server.handleCreateOrder)
	mux.HandleFunc("GET /api/orders/{id}", server.handleGetOrder)
	mux.HandleFunc("POST /api/admin/auth/otp/request", server.handleAdminRequestOTP)
	mux.HandleFunc("POST /api/admin/auth/otp/verify", server.handleAdminVerifyOTP)
	mux.HandleFunc("POST /api/admin/auth/logout", server.handleAdminLogout)
	mux.HandleFunc("GET /api/admin/auth/me", server.handleAdminMe)
	return withCORS(mux)
}

func (server *Server) handleHealth(writer http.ResponseWriter, request *http.Request) {
	writeJSON(writer, http.StatusOK, map[string]string{"status": "ok"})
}

func (server *Server) handleReady(writer http.ResponseWriter, request *http.Request) {
	ctx, cancel := context.WithTimeout(request.Context(), 2*time.Second)
	defer cancel()

	if err := server.db.PingContext(ctx); err != nil {
		writeError(writer, http.StatusServiceUnavailable, "database is not ready")
		return
	}

	writeJSON(writer, http.StatusOK, map[string]string{"status": "ready"})
}

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}

func writeError(writer http.ResponseWriter, statusCode int, message string) {
	writeJSON(writer, statusCode, map[string]string{"error": message})
}

func writeInternalError(writer http.ResponseWriter, message string, err error) {
	log.Printf("[api] %s: %v", message, err)
	writeError(writer, http.StatusInternalServerError, message)
}

func notFoundOrError(writer http.ResponseWriter, err error) {
	if errors.Is(err, sql.ErrNoRows) {
		writeError(writer, http.StatusNotFound, "not found")
		return
	}
	writeError(writer, http.StatusInternalServerError, "internal server error")
}

func withCORS(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("WEB_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		origin := request.Header.Get("Origin")
		if origin == allowedOrigin {
			writer.Header().Set("Access-Control-Allow-Origin", origin)
			writer.Header().Set("Access-Control-Allow-Credentials", "true")
			writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		}

		if request.Method == http.MethodOptions {
			writer.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(writer, request)
	})
}
