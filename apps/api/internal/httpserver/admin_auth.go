package httpserver

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"math/big"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const adminSessionCookieName = "breadify_admin_session"

type adminOTPRequest struct {
	Username string `json:"username"`
}

type adminOTPVerifyRequest struct {
	Username string `json:"username"`
	OTP      string `json:"otp"`
}

type adminUserResponse struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Name     string `json:"name"`
}

type adminOTPRecord struct {
	Code      string
	ExpiresAt time.Time
}

var adminOTPStore = struct {
	sync.Mutex
	records map[string]adminOTPRecord
}{
	records: make(map[string]adminOTPRecord),
}

func (server *Server) handleAdminRequestOTP(writer http.ResponseWriter, request *http.Request) {
	var payload adminOTPRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid request body")
		return
	}

	username := normalizeAdminUsername(payload.Username)
	if username == "" {
		writeError(writer, http.StatusBadRequest, "username is required")
		return
	}

	if isAdminUsername(username) {
		code, err := generateOTP()
		if err != nil {
			writeInternalError(writer, "cannot generate otp", err)
			return
		}

		adminOTPStore.Lock()
		adminOTPStore.records[username] = adminOTPRecord{
			Code:      code,
			ExpiresAt: time.Now().Add(5 * time.Minute),
		}
		adminOTPStore.Unlock()

		if err := sendAdminOTP(adminEmail(), code); err != nil {
			writeInternalError(writer, "cannot send otp", err)
			return
		}
	}

	writeJSON(writer, http.StatusOK, map[string]string{
		"status": "otp_sent",
	})
}

func (server *Server) handleAdminVerifyOTP(writer http.ResponseWriter, request *http.Request) {
	var payload adminOTPVerifyRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid request body")
		return
	}

	username := normalizeAdminUsername(payload.Username)
	otp := strings.TrimSpace(payload.OTP)
	if username == "" || otp == "" {
		writeError(writer, http.StatusBadRequest, "username and otp are required")
		return
	}

	if !verifyAdminOTP(username, otp) {
		writeError(writer, http.StatusUnauthorized, "invalid otp")
		return
	}

	expiresAt := time.Now().Add(8 * time.Hour)
	token, err := signAdminSession(username, expiresAt)
	if err != nil {
		writeInternalError(writer, "cannot create admin session", err)
		return
	}

	http.SetCookie(writer, &http.Cookie{
		Name:     adminSessionCookieName,
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(writer, http.StatusOK, adminUserResponse{
		Username: username,
		Email:    adminEmail(),
		Name:     "Admin",
	})
}

func (server *Server) handleAdminLogout(writer http.ResponseWriter, request *http.Request) {
	clearAdminSessionCookie(writer)
	writeJSON(writer, http.StatusOK, map[string]string{"status": "ok"})
}

func (server *Server) handleAdminMe(writer http.ResponseWriter, request *http.Request) {
	username, err := verifyAdminRequest(request)
	if err != nil {
		writeError(writer, http.StatusUnauthorized, "unauthorized")
		return
	}

	writeJSON(writer, http.StatusOK, adminUserResponse{
		Username: username,
		Email:    adminEmail(),
		Name:     "Admin",
	})
}

func adminEmail() string {
	email := os.Getenv("ADMIN_EMAIL")
	if email == "" {
		return "admin@breadify.vn"
	}
	return email
}

func adminUsername() string {
	username := os.Getenv("ADMIN_USERNAME")
	if username == "" {
		return "admin"
	}
	return normalizeAdminUsername(username)
}

func normalizeAdminUsername(username string) string {
	return strings.ToLower(strings.TrimSpace(username))
}

func isAdminUsername(username string) bool {
	return subtle.ConstantTimeCompare([]byte(normalizeAdminUsername(username)), []byte(adminUsername())) == 1
}

func generateOTP() (string, error) {
	maxValue := big.NewInt(1_000_000)
	value, err := rand.Int(rand.Reader, maxValue)
	if err != nil {
		return "", err
	}
	return fmtSixDigits(value.Int64()), nil
}

func fmtSixDigits(value int64) string {
	text := strconv.FormatInt(value, 10)
	for len(text) < 6 {
		text = "0" + text
	}
	return text
}

func verifyAdminOTP(username string, otp string) bool {
	username = normalizeAdminUsername(username)
	if !isAdminUsername(username) {
		return false
	}

	adminOTPStore.Lock()
	record, ok := adminOTPStore.records[username]
	if ok {
		delete(adminOTPStore.records, username)
	}
	adminOTPStore.Unlock()

	if !ok || time.Now().After(record.ExpiresAt) {
		return false
	}

	return subtle.ConstantTimeCompare([]byte(otp), []byte(record.Code)) == 1
}

func sendAdminOTP(email string, code string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")
	secure := strings.ToLower(strings.TrimSpace(os.Getenv("SMTP_SECURE")))

	if host == "" {
		log.Printf("[admin-otp] OTP for %s: %s", email, code)
		return nil
	}
	if port == "" {
		port = "587"
	}
	if from == "" {
		from = user
	}
	if user == "" || password == "" || from == "" {
		return errors.New("SMTP_USER, SMTP_PASSWORD and SMTP_FROM are required when SMTP_HOST is set")
	}

	address := host + ":" + port
	auth := smtp.PlainAuth("", user, password, host)
	message := strings.Join([]string{
		"To: " + email,
		"Subject: Breadify admin OTP",
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		"Mã OTP đăng nhập admin Breadify của bạn là: " + code,
		"Mã này hết hạn sau 5 phút.",
	}, "\r\n")

	if secure == "tls" || (secure == "" && port == "465") {
		return sendMailWithImplicitTLS(address, host, auth, from, []string{email}, []byte(message))
	}

	return smtp.SendMail(address, auth, from, []string{email}, []byte(message))
}

func sendMailWithImplicitTLS(address string, host string, auth smtp.Auth, from string, recipients []string, message []byte) error {
	connection, err := tls.Dial("tcp", address, &tls.Config{
		ServerName: host,
		MinVersion: tls.VersionTLS12,
	})
	if err != nil {
		return err
	}
	defer connection.Close()

	client, err := smtp.NewClient(connection, host)
	if err != nil {
		return err
	}
	defer client.Close()

	if err := client.Auth(auth); err != nil {
		return err
	}
	if err := client.Mail(from); err != nil {
		return err
	}
	for _, recipient := range recipients {
		if err := client.Rcpt(recipient); err != nil {
			return err
		}
	}

	writer, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := writer.Write(message); err != nil {
		_ = writer.Close()
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}

	return client.Quit()
}

func verifyAdminRequest(request *http.Request) (string, error) {
	cookie, err := request.Cookie(adminSessionCookieName)
	if err != nil || cookie.Value == "" {
		return "", errors.New("missing admin session")
	}
	return verifyAdminSession(cookie.Value)
}

func signAdminSession(username string, expiresAt time.Time) (string, error) {
	expiresUnix := strconv.FormatInt(expiresAt.Unix(), 10)
	payload := normalizeAdminUsername(username) + "|" + expiresUnix
	signature, err := signAdminPayload(payload)
	if err != nil {
		return "", err
	}

	token := payload + "|" + signature
	return base64.RawURLEncoding.EncodeToString([]byte(token)), nil
}

func verifyAdminSession(token string) (string, error) {
	decoded, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return "", err
	}

	parts := strings.Split(string(decoded), "|")
	if len(parts) != 3 {
		return "", errors.New("invalid admin session")
	}

	payload := parts[0] + "|" + parts[1]
	expectedSignature, err := signAdminPayload(payload)
	if err != nil {
		return "", err
	}
	if subtle.ConstantTimeCompare([]byte(parts[2]), []byte(expectedSignature)) != 1 {
		return "", errors.New("invalid admin session signature")
	}

	expiresUnix, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return "", err
	}
	if time.Now().After(time.Unix(expiresUnix, 0)) {
		return "", errors.New("admin session expired")
	}

	return parts[0], nil
}

func signAdminPayload(payload string) (string, error) {
	secret := os.Getenv("ADMIN_SESSION_SECRET")
	if secret == "" {
		return "", errors.New("ADMIN_SESSION_SECRET is required")
	}

	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil)), nil
}

func clearAdminSessionCookie(writer http.ResponseWriter) {
	http.SetCookie(writer, &http.Cookie{
		Name:     adminSessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}
