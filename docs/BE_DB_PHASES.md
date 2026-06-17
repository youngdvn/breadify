# Breadify BE/DB Implementation Phases

Tài liệu này là roadmap backend/database cho mục tiêu hiện tại của Breadify: hoàn thiện MVP vận hành cửa hàng, trong đó khách đặt món qua web/PWA, admin nhận và xử lý đơn trên màn hình tablet/desktop, hóa đơn có QR chuyển khoản, sau đó mở rộng sang quản lý menu, in bill, thống kê và deploy production.

## 1. Mục Tiêu Hiện Tại

### Mục Tiêu Sản Phẩm

- Customer app đọc menu thật, dùng cart backend session và tạo order thật.
- Checkout hỗ trợ cả `pickup` và `delivery`.
- Thanh toán MVP chỉ gồm `cash` và `vietqr`; chưa tích hợp payment gateway/webhook.
- Admin đăng nhập bằng username + OTP email, không dùng mật khẩu.
- Admin phải xem được đơn mới, đổi trạng thái đơn và thao tác vận hành tại quầy.
- Hóa đơn online dùng order thật, có QR VietQR khi đơn chọn chuyển khoản.
- Sau khi admin orders ổn định mới triển khai CRUD menu, in nhiệt LAN TCP, thống kê và hardening.

### Phạm Vi Kỹ Thuật

- `apps/web`: Next.js 16 App Router, React 19, PWA storefront và admin UI.
- `apps/api`: Go HTTP API, sở hữu business logic, DB access, migrations và seed.
- PostgreSQL 16, SQL migrations, không dùng Prisma/ORM.
- UUID v7 sinh ở Go app layer, không phụ thuộc PostgreSQL extension.
- Shared UI nằm ở `packages/ui`.
- Web gọi Go API qua `NEXT_PUBLIC_API_URL`; API giới hạn CORS bằng `WEB_ORIGIN`.

## 2. Trạng Thái Repo Hiện Tại

### Đã Có

- Go API trong `apps/api`.
- PostgreSQL schema cho `menu_items`, `orders`, `order_items`, `cart_sessions`, `cart_items`.
- Migration runner, seed runner và seed menu ban đầu.
- Health/readiness endpoints.
- Customer menu API: `GET /api/menu`, `GET /api/menu/{slug}`.
- Backend cart session bằng HttpOnly cookie.
- Cart API: get/add/update/delete/clear.
- Order API: tạo order từ cart, tính lại giá từ DB, lưu order transaction, clear cart sau khi tạo.
- Order detail API: `GET /api/orders/{id}`.
- VietQR URL được build từ cấu hình ngân hàng và trả theo order khi payment method là `vietqr`.
- Web menu/product detail/cart/checkout/success/order detail đã dùng API thật.
- Invoice online dùng order thật.
- Admin auth API bằng OTP email và signed HttpOnly session cookie.
- Admin login UI, admin shell, admin home và route admin placeholder.
- PWA manifest, app icons, service worker và offline page.

### Chưa Có

- Admin orders API thật.
- Admin orders UI thật, hiện vẫn dùng mock data.
- Admin menu API/CRUD thật.
- Admin menu UI thật, hiện vẫn dùng mock data.
- SSE realtime cho đơn mới.
- API cập nhật order status/payment status.
- In bill LAN TCP và API in lại bill.
- Upload ảnh món.
- Stats API/dashboard thật.
- Production config, deploy checklist và test browser end-to-end.

### Cần Lưu Ý

- `apps/web/app/page.tsx` vẫn dùng một số mock data cho home/favorites/deals; menu và checkout flow chính đã dùng API thật.
- API hiện chưa có endpoint riêng `GET /api/payment/qr`; QR thanh toán nằm trong order response.
- Admin account hiện lấy từ `.env`; chưa có bảng users/roles.
- Category hiện là enum DB `banh_mi`, `do_uong`; CRUD category chưa nằm trong schema.

## 3. Quyết Định Đã Chốt

- Runtime chính: Next.js cho web, Go cho API, PostgreSQL cho DB.
- Backend chính không đặt trong Next.js route handlers.
- Payment production MVP chỉ dùng `cash` và `vietqr`.
- Order status gồm `pending`, `in_progress`, `done`, `cancelled`.
- Fulfillment type gồm `pickup`, `delivery`.
- Đơn `delivery` bắt buộc tên, SĐT và địa chỉ.
- Đơn `pickup` không bắt buộc tên/SĐT/địa chỉ.
- Phí giao hàng cố định `20.000đ` cho mỗi đơn `delivery`.
- Cart dùng backend session qua HttpOnly cookie.
- Admin login dùng username + OTP email, OTP thay thế mật khẩu.
- Nếu chưa cấu hình SMTP, OTP được log ra terminal API trong môi trường dev.
- `OrderItem` lưu snapshot tên/giá để hóa đơn không đổi khi menu thay đổi.
- Không xóa hard menu item đã có order nếu chưa có quyết định rõ; ưu tiên tắt `available`.

## 4. Câu Hỏi Còn Mở

1. Admin production dùng 1 tài khoản `.env` hay cần nhiều nhân viên/role?
2. Category giữ cố định bằng enum DB hay cần CRUD category?
3. Ảnh món dùng local `/uploads` hay object storage?
4. Thông tin cửa hàng production cuối cùng là gì?
5. Thông tin ngân hàng/VietQR production cuối cùng là gì?
6. Môi trường deploy có hỗ trợ SSE/long-lived connection không?
7. Máy in nhiệt sẽ kết nối LAN TCP với IP/port nào?
8. Hóa đơn cần thêm bản PDF, text thermal bill hay chỉ HTML online ở MVP?

## 5. API Surface

### Customer Đã Có

- `GET /healthz`
- `GET /readyz`
- `GET /api/menu`
- `GET /api/menu?category=banh_mi`
- `GET /api/menu/{slug}`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/{id}`
- `DELETE /api/cart/items/{id}`
- `DELETE /api/cart`
- `POST /api/orders`
- `GET /api/orders/{id}`

### Admin Auth Đã Có

- `POST /api/admin/auth/otp/request`
- `POST /api/admin/auth/otp/verify`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`

### Admin Nên Làm Tiếp Theo

- `GET /api/admin/orders`: danh sách đơn, filter theo status/date/payment.
- `GET /api/admin/orders/{id}`: chi tiết đơn cho admin.
- `PATCH /api/admin/orders/{id}/status`: đổi `pending -> in_progress -> done/cancelled`.
- `PATCH /api/admin/orders/{id}/payment-status`: đánh dấu payment nếu cần.
- `GET /api/admin/orders/stream`: SSE báo đơn mới/trạng thái thay đổi.
- `GET /api/admin/menu`: danh sách menu cho admin, gồm cả món tạm hết.
- `POST /api/admin/menu`: tạo món.
- `PATCH /api/admin/menu/{id}`: sửa món.
- `PATCH /api/admin/menu/{id}/availability`: bật/tắt món.
- `DELETE /api/admin/menu/{id}`: xóa mềm hoặc hard-delete nếu chưa có order.
- `POST /api/admin/print/{id}`: in lại bill.
- `GET /api/admin/stats/today`: thống kê vận hành ngày hiện tại.

## 6. Data Model Hiện Tại

- `menu_items`
  - `id`, `name`, `slug`, `category`, `price`, `image_url`, `description`, `detail`, `available`, `sort_order`, timestamps.
- `orders`
  - `id`, `status`, `fulfillment_type`, `payment_method`, `payment_status`, `customer_name`, `phone`, `address`, `note`, `subtotal`, `shipping_fee`, `discount`, `total_price`, timestamps.
- `order_items`
  - `id`, `order_id`, `menu_item_id`, `name_snapshot`, `unit_price`, `quantity`, `note`, `line_total`, `created_at`.
- `cart_sessions`
  - `id`, `created_at`, `updated_at`, `expires_at`.
- `cart_items`
  - `id`, `cart_session_id`, `menu_item_id`, `quantity`, `note`, timestamps.

## 7. Phase Triển Khai

### Phase 0 — Quyết Định Và Chuẩn Bị

Trạng thái: hoàn thành phần quyết định nền tảng, còn vài câu hỏi production.

- Chốt runtime Next.js + Go + PostgreSQL.
- Chốt payment MVP `cash` và `vietqr`.
- Chốt fulfillment `pickup` và `delivery`.
- Chốt order status có `cancelled`.
- Chốt cart backend session.
- Chốt admin auth bằng OTP email.
- Cập nhật `.env.example` cho web/API.
- Còn mở: multi-admin, category CRUD, upload storage, deploy/SSE, thông tin production.

### Phase 1 — Go API Và Database Foundation

Trạng thái: đã triển khai.

- Go module `apps/api`.
- PostgreSQL driver `pgx`.
- SQL migrations.
- DB connection pool.
- UUID v7 và short id helper.
- Migration runner và seed runner.
- Seed menu ban đầu.
- Docker Compose PostgreSQL 16.
- Health/readiness endpoints.

### Phase 2 — Customer Menu APIs

Trạng thái: đã triển khai luồng chính.

- `GET /api/menu`.
- `GET /api/menu/{slug}`.
- Validate query category.
- DTO/mapper menu cho web.
- Menu page và product detail đọc API thật.
- Web env chỉ giữ public frontend env.
- Còn nên làm: fallback/loading/error UI tốt hơn khi API lỗi.

### Phase 3 — Cart Và Order APIs

Trạng thái: đã triển khai luồng chính.

- Backend cart session bằng HttpOnly cookie.
- Cart CRUD API.
- `POST /api/orders` tạo order từ cart.
- Validate fulfillment/payment/customer info.
- Recalculate giá từ DB.
- Chặn món hết hàng.
- Áp dụng shipping fee cho delivery.
- Lưu order/order items bằng transaction.
- Clear cart sau khi tạo order.
- `GET /api/orders/{id}`.
- VietQR URL trong order response.

### Phase 4 — Customer Checkout Integration

Trạng thái: đã triển khai luồng chính.

- Add-to-cart từ menu/home ghi vào backend cart.
- Cart page đọc/sửa/xóa item từ backend cart.
- Checkout chọn pickup/delivery.
- Checkout chọn cash/vietqr.
- Checkout submit tạo order thật.
- Success page fetch order thật.
- Order detail route thật.
- Recent orders lưu local trên thiết bị.
- Invoice export dùng order thật và hiển thị QR VietQR khi phù hợp.
- Còn nên làm: browser test tạo đơn, checkout success, invoice export.

### Phase 5 — Admin Auth Và Admin Shell

Trạng thái: đã triển khai nền tảng, cần browser test.

- Admin OTP request/verify/logout/me API.
- Signed HttpOnly admin session cookie.
- SMTP STARTTLS/implicit TLS.
- Dev fallback log OTP ra terminal.
- Admin login page hai bước.
- Admin home kiểm tra session và redirect nếu chưa đăng nhập.
- Admin shell riêng cho tablet/desktop.
- Placeholder pages cho orders/menu/QR.
- Còn nên làm: test login/logout trong browser với API thật.

### Phase 6 — Admin Orders MVP

Trạng thái: đã triển khai phần cốt lõi, còn thiếu date filter/payment-status và browser test.

- Đã tạo admin auth helper dùng lại `verifyAdminRequest`.
- Đã tạo `GET /api/admin/orders` với status filter và limit.
- Đã tạo `GET /api/admin/orders/{id}`.
- Đã tạo `PATCH /api/admin/orders/{id}/status`.
- Đã validate transition `pending -> in_progress/cancelled`, `in_progress -> done/cancelled`, terminal status không đổi tiếp.
- Đã thay admin orders page dùng API thật và bỏ mock data.
- Đã hiển thị trạng thái, payment, fulfillment, customer info, items và tổng tiền.
- Đã thêm action nhận đơn/hoàn tất/hủy và refresh thủ công.
- Còn nên làm: date/range filter, `PATCH /api/admin/orders/{id}/payment-status` nếu cần, browser test flow customer tạo đơn -> admin thấy đơn -> admin đổi trạng thái.

### Phase 7 — Realtime Và Vận Hành Đơn

Trạng thái: sau Phase 6.

- Tạo SSE endpoint `GET /api/admin/orders/stream`.
- Broadcast order mới sau khi `POST /api/orders` commit thành công.
- Broadcast status change sau khi admin cập nhật đơn.
- Admin UI nhận SSE và refresh/append đơn mới.
- Thêm âm báo/tín hiệu trực quan khi có đơn mới.
- Thêm nút refresh thủ công làm fallback khi SSE lỗi.
- Đánh giá môi trường deploy có hỗ trợ long-lived connection.

### Phase 8 — Admin Menu

Trạng thái: sau admin orders/realtime.

- Tạo admin menu list API gồm cả món unavailable.
- Tạo create/update menu item API.
- Tạo toggle availability API.
- Quyết định soft-delete/hard-delete menu item.
- Tạo upload ảnh và serve ảnh nếu chọn local upload.
- Admin menu page dùng API thật, bỏ mock data.
- Đảm bảo customer menu chỉ hiển thị đúng trạng thái bán/hết.

### Phase 9 — Printing, Stats, QR Và Hardening

Trạng thái: sau MVP vận hành đơn.

- Tạo service build bill content dùng chung cho online invoice và thermal printer.
- Tạo printer service LAN TCP với safe wrapper.
- Không để lỗi in làm fail order đã tạo.
- Tạo API in lại bill.
- Test với máy in thật trong LAN.
- Tạo stats API cho doanh thu ngày, số đơn, top món.
- Admin QR trỏ domain production.
- Logging lỗi DB/API/printer.
- Production build và deploy checklist.
- Kiểm tra PWA sau khi dùng API thật.

## 8. Rủi Ro Kỹ Thuật

- Next.js 16 có thay đổi API/convention; trước khi sửa frontend route/UI trong `apps/web`, đọc guide liên quan trong `node_modules/next/dist/docs/`.
- Go API tách riêng nên CORS/cookie credential phải cấu hình đúng giữa web và API.
- Admin OTP đang lưu memory; restart API sẽ mất OTP đang pending. Chấp nhận cho MVP, nhưng nếu cần scale nhiều instance phải chuyển sang DB/Redis.
- SSE có thể không phù hợp serverless hoặc proxy timeout thấp.
- Printer LAN TCP không test được nếu không có thiết bị và cùng mạng.
- Local upload cần volume khi deploy để không mất ảnh.
- VietQR production phụ thuộc thông tin ngân hàng chính xác.

## 9. Definition Of Done Cho MVP Vận Hành

- Customer xem menu, thêm cart, checkout và tạo order thật thành công.
- Admin đăng nhập OTP thành công.
- Admin xem được danh sách đơn thật.
- Admin đổi được trạng thái đơn thật.
- Admin nhận được đơn mới realtime hoặc fallback refresh rõ ràng.
- Hóa đơn online dùng order thật và QR VietQR đúng thông tin.
- Seed chạy được trên DB sạch.
- `go test ./...`, `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web build` pass.
- Browser test tối thiểu qua flow customer order -> admin processing -> done.
