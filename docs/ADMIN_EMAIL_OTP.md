# Admin Email OTP

Breadify admin dùng `username → OTP email`, không dùng mật khẩu.

## Cấu Hình

Điền các biến sau trong `apps/api/.env`:

```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_SESSION_SECRET=replace-with-long-random-secret

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password-or-app-password
SMTP_FROM=your-smtp-user
```

## SMTP Secure Mode

- `SMTP_PORT=587`, `SMTP_SECURE=`: dùng SMTP STARTTLS thông thường.
- `SMTP_PORT=465`, `SMTP_SECURE=tls`: dùng implicit TLS.
- Nếu `SMTP_HOST` để trống, OTP không gửi mail thật và chỉ log ra terminal API.

## Cần Cung Cấp

Không gửi password thật qua chat. Bạn chỉ cần tự điền vào `apps/api/.env`.

- Email nhận OTP: giá trị `ADMIN_EMAIL`.
- Username đăng nhập admin: giá trị `ADMIN_USERNAME`.
- SMTP host/port của nhà cung cấp mail.
- SMTP user.
- SMTP password hoặc app password.
- Email gửi đi: giá trị `SMTP_FROM`.

Sau khi đổi `.env`, restart Go API.
