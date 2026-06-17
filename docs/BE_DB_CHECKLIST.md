# Breadify BE/DB Checklist

File này dùng để theo dõi tiến độ backend/database theo mục tiêu hiện tại: hoàn thiện MVP vận hành đơn hàng cho Breadify trước, sau đó mở rộng sang realtime, CRUD menu, in bill, stats và deploy.

## Trạng Thái Hiện Tại

- [x] Đọc `ANALYSIS.md`.
- [x] Khảo sát repo hiện tại.
- [x] Xác định repo dùng `pnpm`, `apps/web`, `apps/api`, `packages/ui`.
- [x] Chốt backend Go trong `apps/api`, tách khỏi `apps/web`.
- [x] Cập nhật roadmap phase theo trạng thái code hiện tại.
- [x] Customer menu/cart/checkout/order đã dùng API thật cho luồng chính.
- [x] Admin auth OTP và admin shell đã có.
- [x] Admin orders đã gọi API thật cho list/update status.
- [ ] Admin menu vẫn dùng mock/placeholder.
- [ ] Cần test end-to-end trên browser với PostgreSQL/API thật.
- [ ] Docker/PostgreSQL local chưa được xác nhận chạy trong máy hiện tại.

## Phase 0 — Quyết Định Và Chuẩn Bị

- [x] Xác nhận runtime: Next.js web + Go API + PostgreSQL.
- [x] Xác nhận hình thức vận hành: hỗ trợ cả pickup và delivery.
- [x] Xác nhận payment methods production MVP: `cash` và `vietqr`.
- [x] Xác nhận có `cancelled` order status.
- [x] Xác nhận phí giao hàng cố định `20.000đ` cho đơn delivery.
- [x] Xác nhận cart dùng backend session.
- [x] Xác nhận delivery bắt buộc tên/SĐT/địa chỉ.
- [x] Xác nhận pickup không bắt buộc tên/SĐT/địa chỉ.
- [x] Xác nhận admin login dùng username + OTP email thay cho mật khẩu.
- [ ] Xác nhận admin production dùng 1 tài khoản `.env` hay nhiều user/role.
- [ ] Xác nhận category giữ enum cố định hay cần CRUD category.
- [ ] Xác nhận upload ảnh local `/uploads` hay object storage.
- [ ] Xác nhận thông tin cửa hàng production.
- [ ] Xác nhận thông tin ngân hàng/VietQR production.
- [ ] Xác nhận môi trường deploy có hỗ trợ SSE.
- [ ] Xác nhận thông tin máy in nhiệt LAN TCP.

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
- [x] Tạo bảng `cart_sessions`.
- [x] Tạo bảng `cart_items`.
- [x] Tạo DB connection pool.
- [x] Tạo helper UUID v7 và short id bằng Go.
- [x] Tạo migration runner.
- [x] Tạo seed runner.
- [x] Tạo seed menu ban đầu.
- [x] Tạo `.env.example` cho API.
- [x] Tạo `.env.example` cho web.
- [x] Tạo `docker-compose.yml` cho PostgreSQL 16.
- [x] Tạo health/readiness endpoints.
- [ ] Chạy migrate thành công trên PostgreSQL local.
- [ ] Chạy seed thành công trên PostgreSQL local.

## Phase 2 — Customer Menu APIs

- [x] Implement `GET /api/menu`.
- [x] Implement `GET /api/menu/{slug}`.
- [x] Validate query category.
- [x] Handle item không tồn tại.
- [x] Tạo DTO/mapper cho menu.
- [x] Thay menu page dùng API.
- [x] Thay product detail dùng API.
- [x] Tách client renderer khỏi server fetch cho menu.
- [x] Làm sạch `apps/web/.env.example`, chỉ giữ public frontend env.
- [ ] Cải thiện fallback/loading/error UI khi API lỗi.
- [ ] Giảm phụ thuộc mock data trên home/favorites/deals nếu cần production.

## Phase 3 — Cart Và Order APIs

- [x] Tạo backend session cart bằng HttpOnly cookie.
- [x] Implement `GET /api/cart`.
- [x] Implement `POST /api/cart/items`.
- [x] Implement `PATCH /api/cart/items/{id}`.
- [x] Implement `DELETE /api/cart/items/{id}`.
- [x] Implement `DELETE /api/cart`.
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
- [x] Build VietQR URL trong order response khi payment method là `vietqr`.
- [x] Chuẩn hóa lỗi API cơ bản cho client.

## Phase 4 — Customer Checkout Integration

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
- [x] Thêm route chi tiết đơn hàng thật `/orders/[id]`.
- [x] Lưu order vừa tạo vào lịch sử đơn local trên thiết bị.
- [x] Export invoice dùng order thật, không dùng mock.
- [x] Export invoice hiển thị QR VietQR nếu đơn chọn chuyển khoản.
- [ ] Test tạo đơn customer trên browser.
- [ ] Test checkout success trên browser.
- [ ] Test invoice export trên browser.

## Phase 5 — Admin Auth Và Admin Shell

- [x] Đọc docs Next.js 16 liên quan auth/login page.
- [x] Chốt không dùng NextAuth vì backend viết bằng Go.
- [x] Tạo Go admin auth bằng username + OTP email + signed HttpOnly session cookie.
- [x] Tạo API `POST /api/admin/auth/otp/request`.
- [x] Tạo API `POST /api/admin/auth/otp/verify`.
- [x] Tạo API `POST /api/admin/auth/logout`.
- [x] Tạo API `GET /api/admin/auth/me`.
- [x] Tạo admin login route/page hai bước: username -> OTP email.
- [x] Bảo vệ admin home bằng kiểm tra session từ Go API.
- [x] Thêm env admin/SMTP vào `.env.example`.
- [x] Hỗ trợ SMTP thật cho OTP qua STARTTLS/implicit TLS.
- [x] Thêm tài liệu cấu hình admin email OTP.
- [x] Tách admin khỏi mobile storefront shell.
- [x] Tạo admin shell riêng cho tablet/desktop.
- [x] Tạo placeholder desktop pages cho admin orders/menu/QR.
- [x] Refactor `apps/web` tách API calls vào `services/` và shared type vào `types/`.
- [ ] Test login/logout admin trên browser.
- [ ] Kiểm tra cookie admin hoạt động đúng với CORS credential.

## Phase 6 — Admin Orders MVP

- [x] Tạo admin auth middleware/helper cho protected admin API.
- [x] Tạo `GET /api/admin/orders`.
- [x] Hỗ trợ filter orders theo status.
- [ ] Hỗ trợ filter orders theo ngày hoặc range cơ bản.
- [x] Hỗ trợ pagination/limit để tránh load toàn bộ DB.
- [x] Tạo `GET /api/admin/orders/{id}`.
- [x] Tạo `PATCH /api/admin/orders/{id}/status`.
- [x] Validate status transition hợp lệ.
- [ ] Tạo `PATCH /api/admin/orders/{id}/payment-status` nếu cần thao tác thu tiền.
- [x] Admin orders UI gọi API thật.
- [x] Bỏ mock orders khỏi `apps/web/app/admin/orders/page.tsx`.
- [x] Hiển thị mã đơn, khách, fulfillment, payment, status, tổng tiền.
- [x] Hiển thị items/note/customer info đủ để vận hành.
- [x] Thêm action nhận đơn/đang chuẩn bị/hoàn tất/hủy.
- [x] Thêm refresh thủ công.
- [ ] Test flow customer tạo đơn -> admin thấy đơn -> admin đổi trạng thái.

## Phase 7 — Realtime Và Vận Hành Đơn

- [ ] Tạo event broadcaster trong Go API.
- [ ] Tạo `GET /api/admin/orders/stream`.
- [ ] Push order mới sau khi transaction tạo order commit thành công.
- [ ] Push status change sau khi admin cập nhật đơn.
- [ ] Admin UI nhận SSE.
- [ ] Admin UI append/refresh đơn mới khi nhận event.
- [ ] Thêm beep hoặc tín hiệu trực quan khi có đơn mới.
- [ ] Fallback về refresh thủ công khi SSE lỗi.
- [ ] Test SSE real-time trên browser.
- [ ] Kiểm tra deploy/proxy có hỗ trợ long-lived connection.

## Phase 8 — Admin Menu

- [ ] Tạo admin menu list API gồm cả món unavailable.
- [ ] Tạo API create menu item.
- [ ] Tạo API update menu item.
- [ ] Tạo API toggle available.
- [ ] Quyết định delete/soft-delete menu item.
- [ ] Implement delete/soft-delete theo quyết định.
- [ ] Tạo upload ảnh.
- [ ] Serve ảnh upload.
- [ ] Admin menu UI dùng API thật.
- [ ] Bỏ mock items khỏi `apps/web/app/admin/menu/page.tsx`.
- [ ] Đảm bảo customer menu không hiển thị sai trạng thái còn/hết.

## Phase 9 — Printing, Stats, QR Và Hardening

- [ ] Tạo service build bill content dùng chung.
- [x] Tạo helper build VietQR URL.
- [x] Tạo QR data theo payment method production.
- [ ] Tạo printer service LAN TCP.
- [ ] Bọc printer bằng safe wrapper.
- [ ] Không để lỗi in làm fail order đã tạo.
- [ ] Trigger in sau khi tạo đơn nếu bật cấu hình.
- [ ] Implement API in lại bill.
- [ ] Test với máy in thật.
- [ ] API thống kê ngày.
- [ ] API top món.
- [ ] Admin stats UI dùng API thật.
- [ ] Admin QR trỏ domain production.
- [ ] Logging lỗi DB/API/printer.
- [ ] Production build.
- [ ] Kiểm tra PWA sau khi dùng API thật.
- [ ] Lập deploy checklist.

## Validation Checklist

- [x] `go test ./...` trong `apps/api` với `GOCACHE` trong workspace.
- [x] `pnpm --filter web lint`.
- [x] `pnpm --filter web typecheck`.
- [x] `pnpm --filter web build`.
- [ ] `docker compose up -d postgres`.
- [ ] `go run ./cmd/migrate` trên PostgreSQL local.
- [ ] `go run ./cmd/seed` trên PostgreSQL local.
- [ ] Browser test customer tạo đơn.
- [ ] Browser test checkout success.
- [ ] Browser test invoice export.
- [ ] Browser test admin login/logout.
- [ ] Browser test admin order status.
- [ ] Browser test SSE real-time.
- [ ] Test seed DB sạch.
