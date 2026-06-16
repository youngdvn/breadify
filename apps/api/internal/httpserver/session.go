package httpserver

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"breadify/apps/api/internal/id"
)

const cartSessionCookieName = "breadify_cart_session"

func (server *Server) getOrCreateCartSessionID(writer http.ResponseWriter, request *http.Request) (string, error) {
	if cookie, err := request.Cookie(cartSessionCookieName); err == nil && cookie.Value != "" {
		var exists bool
		err := server.db.QueryRowContext(
			request.Context(),
			`
				SELECT EXISTS(
					SELECT 1
					FROM cart_sessions
					WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
				)
			`,
			cookie.Value,
		).Scan(&exists)
		if err != nil {
			return "", err
		}
		if exists {
			return cookie.Value, nil
		}
	}

	sessionID, err := id.NewUUIDV7()
	if err != nil {
		return "", err
	}

	expiresAt := time.Now().Add(30 * 24 * time.Hour)
	_, err = server.db.ExecContext(
		request.Context(),
		`
			INSERT INTO cart_sessions (id, expires_at)
			VALUES ($1, $2)
		`,
		sessionID,
		expiresAt,
	)
	if err != nil {
		return "", err
	}

	http.SetCookie(writer, &http.Cookie{
		Name:     cartSessionCookieName,
		Value:    sessionID,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	return sessionID, nil
}

func (server *Server) getCartSessionID(request *http.Request) (string, error) {
	cookie, err := request.Cookie(cartSessionCookieName)
	if err != nil || cookie.Value == "" {
		return "", sql.ErrNoRows
	}

	var exists bool
	err = server.db.QueryRowContext(
		request.Context(),
		`
			SELECT EXISTS(
				SELECT 1
				FROM cart_sessions
				WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
			)
		`,
		cookie.Value,
	).Scan(&exists)
	if err != nil {
		return "", err
	}
	if !exists {
		return "", sql.ErrNoRows
	}

	return cookie.Value, nil
}

func clearCartSessionCookie(writer http.ResponseWriter) {
	http.SetCookie(writer, &http.Cookie{
		Name:     cartSessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func isMissingCartSession(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}
