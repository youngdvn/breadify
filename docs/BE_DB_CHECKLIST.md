# Breadify BE/DB Checklist

File này dùng để cập nhật tiến độ khi triển khai BE/DB. Mỗi task khi làm xong phải tick `[x]` và ghi chú nếu có thay đổi quyết định.

## Trạng Thái Hiện Tại

- [x] Đọc `ANALYSIS.md`.
- [x] Khảo sát repo hiện tại.
- [x] Xác định repo đang dùng `pnpm`, `apps/web`, `packages/ui`.
- [x] Chốt backend viết bằng Go trong `apps/api`, tách khỏi `apps/web`.
- [x] Tạo kế hoạch phase BE/DB.
- [x] Tạo checklist triển khai BE/DB.
- [ ] Chốt câu hỏi nghiệp vụ với owner.
- [x] Bắt đầu code Phase 1.
- [ ] Docker/PostgreSQL local chưa chạy được vì máy hiện tại chưa có lệnh `docker`.

## Phase 0 — Chốt Quyết Định Và Chuẩn Bị

- [x] Xác nhận hình thức vận hành: pickup, delivery, hay cả hai.
- [x] Xác nhận payment methods production: chỉ cash và chuyển khoản VietQR.
- [x] Xác nhận có cần `Cancelled` order status không.
- [x] Xác nhận phí giao hàng cố định `20.000đ` cho đơn delivery.
- [x] Xác nhận cart dùng backend session.
- [x] Xác nhận delivery bắt buộc tên/SĐT/địa chỉ; pickup không bắt buộc.
- [x] Xác nhận admin login dùng username + OTP email thay cho mật khẩu.
- [ ] Xác nhận admin dùng 1 tài khoản `.env` hay nhiều user.
- [ ] Xác nhận category cố định hay CRUD category.
- [ ] Xác nhận upload ảnh local `/uploads` hay storage khác.
- [ ] Xác nhận thông tin cửa hàng production.
- [ ] Xác nhận thông tin ngân hàng/QR production.
- [ ] Xác nhận môi trường deploy có hỗ trợ SSE.

## Phase 1 — Go API Và Database Foundation

- [x] Gỡ Prisma khỏi `apps/web`.
- [x] Tạo Go module `apps/api`.
- [x] Cài PostgreSQL driver `pgx`.
- [x] Tạo SQL migration đầu tiên trong `apps/api/migrations`.
- [x] Định nghĩa enum DB `category`.
- [x] Định nghĩa enum DB `order_status`.
- [x] Định nghĩa enum DB `fulfillment_type`.
- [x] Định nghĩa enum DB `payment_method`.
- [x] Định nghĩa enum DB `payment_status`.
- [x] Tạo bảng `menu_items`.
- [x] Tạo bảng `orders`.
- [x] Tạo bảng `order_items`.
- [x] Tạo DB connection pool.
- [x] Tạo helper UUID v7 và short id bằng Go.
- [x] Tạo migration runner.
- [x] Tạo seed runner.
- [x] Tạo seed menu ban đầu.
- [x] Tạo `.env.example` cho API.
- [x] Tạo `docker-compose.yml` cho PostgreSQL 16.
- [x] Tạo health/readiness endpoints.
- [x] Tạo `GET /api/menu`.
- [x] Tạo `GET /api/menu/{slug}`.
- [ ] Chạy migrate thành công trên PostgreSQL local.
- [ ] Chạy seed thành công trên PostgreSQL local.

## Phase 2 — Customer Read APIs

- [x] Tạo DTO/mapper cho menu.
- [x] Implement `GET /api/menu`.
- [x] Implement `GET /api/menu/{slug}`.
- [x] Validate query category.
- [x] Handle item không tồn tại.
- [x] Thay menu page dùng API.
- [x] Thay product detail dùng API.
- [x] Tách client renderer khỏi server fetch cho menu.
- [x] Làm sạch `apps/web/.env.example`, chỉ giữ public frontend env.
- [ ] Giữ fallback UI/loading hợp lý.

## Phase 3 — Order APIs

- [x] Tạo migration backend cart session.
- [x] Cho phép order pickup không cần customer name/phone.
- [x] Tạo schema validate create order.
- [x] Implement `POST /api/orders`.
- [x] Validate fulfillment type pickup/delivery.
- [x] Bắt buộc tên/SĐT/địa chỉ khi fulfillment là delivery.
- [x] Áp dụng phí delivery cố định `20.000đ`.
- [x] Recalculate giá từ DB.
- [x] Chặn món hết hàng.
- [x] Lưu customer info snapshot.
- [x] Lưu payment method/status.
- [x] API chỉ cho phép payment method `cash` hoặc `vietqr`.
- [x] Lưu order + order items bằng transaction.
- [x] Clear backend cart session sau khi tạo order.
- [x] Implement `GET /api/orders/{id}`.
- [x] Chuẩn hóa lỗi API cho client.

## Phase 4 — Cart/Checkout Integration

- [x] Tạo backend session cart bằng HttpOnly cookie.
- [x] Implement `GET /api/cart`.
- [x] Implement `POST /api/cart/items`.
- [x] Implement `PATCH /api/cart/items/{id}`.
- [x] Implement `DELETE /api/cart/items/{id}`.
- [x] Implement `DELETE /api/cart`.
- [x] Menu add-to-cart ghi vào backend cart thật.
- [x] Home add-to-cart ghi vào backend cart thật.
- [x] Cart page đọc item từ backend cart.
- [x] Cart page sửa/xóa item từ backend cart.
- [x] Checkout cho chọn nhận tại quầy hoặc giao hàng.
- [x] Checkout validate tên/SĐT/địa chỉ theo fulfillment type.
- [x] Checkout chỉ cho chọn tiền mặt hoặc chuyển khoản.
- [x] Checkout submit gọi `POST /api/orders`.
- [x] Redirect sang success theo order id.
- [x] Success page fetch order thật.
- [x] Export invoice dùng order thật, không dùng mock.
- [x] Export invoice hiển thị QR VietQR nếu đơn chọn chuyển khoản.

## Phase 5 — Admin Auth Foundation

- [x] Đọc docs Next.js 16 liên quan auth/login page.
- [x] Chốt không dùng NextAuth vì backend viết bằng Go.
- [x] Tạo Go admin auth bằng username + OTP email + signed HttpOnly session cookie.
- [x] Tạo API `POST /api/admin/auth/otp/request`.
- [x] Tạo API `POST /api/admin/auth/otp/verify`.
- [x] Tạo API `POST /api/admin/auth/logout`.
- [x] Tạo API `GET /api/admin/auth/me`.
- [x] Tạo admin login route/page hai bước: username → OTP email.
- [x] Bảo vệ `/admin` bằng kiểm tra session từ Go API.
- [x] Thêm env admin/SMTP vào `.env.example`.
- [x] Hỗ trợ SMTP thật cho OTP qua STARTTLS/implicit TLS.
- [x] Thêm tài liệu cấu hình admin email OTP.
- [x] Tách admin khỏi mobile storefront shell.
- [x] Tạo admin shell riêng cho tablet/desktop.
- [x] Tạo placeholder desktop pages cho admin orders/menu/QR.
- [x] Refactor `apps/web` tách API calls vào `services/` và shared type vào `types/`.
- [x] Thêm route chi tiết đơn hàng thật `/orders/[id]`.
- [x] Lưu order vừa tạo vào lịch sử đơn local trên thiết bị.
- [ ] Test login/logout trên browser.

## Phase 6 — Admin Menu

- [ ] Tạo admin menu list API.
- [ ] Tạo API create menu item.
- [ ] Tạo API update menu item.
- [ ] Tạo API toggle available.
- [ ] Tạo API delete/soft-delete theo quyết định.
- [ ] Tạo upload ảnh.
- [ ] Serve ảnh upload.
- [ ] Admin UI dùng API thật.

## Phase 7 — Admin Orders Và SSE

- [ ] Tạo admin orders list API.
- [ ] Tạo update order status API.
- [ ] Tạo SSE stream.
- [ ] Push order mới sau khi create order.
- [ ] Admin UI nhận SSE.
- [ ] Beep khi có đơn mới.
- [ ] Nút in lại bill dự phòng.

## Phase 8 — Printing Và Payment QR

- [ ] Tạo service build bill content.
- [x] Tạo helper build VietQR URL.
- [x] Tạo QR data theo payment method production.
- [ ] Tạo printer service LAN TCP.
- [ ] Bọc printer bằng safe wrapper.
- [ ] Trigger in sau khi tạo đơn.
- [ ] Implement API in lại bill.
- [ ] Test với máy in thật.

## Phase 9 — Stats, QR Cửa Hàng, Hardening

- [ ] API thống kê ngày.
- [ ] API top món.
- [ ] Admin stats UI dùng API thật.
- [ ] Admin QR trỏ domain production.
- [ ] Logging lỗi DB/printer.
- [ ] Docker Compose PostgreSQL.
- [ ] Build production.
- [ ] Kiểm tra PWA sau khi dùng API thật.

## Validation Checklist

- [x] `go test ./...` trong `apps/api` với `GOCACHE` trong workspace.
- [x] `pnpm --filter web lint`.
- [x] `pnpm --filter web typecheck`.
- [x] `pnpm --filter web build`.
- [ ] Test tạo đơn customer.
- [ ] Test checkout success.
- [ ] Test invoice export.
- [ ] Test admin order status.
- [ ] Test SSE real-time.
- [ ] Test seed DB sạch.
