# Breadify BE/DB Implementation Phases

Tài liệu này chuyển nội dung trong `ANALYSIS.md` thành kế hoạch triển khai backend và database cho repo hiện tại.

## 1. Phân Tích Nhiệm Vụ

### Mục Tiêu Backend

- Thay mock data hiện tại bằng dữ liệu PostgreSQL thật.
- Cung cấp API cho customer app: menu, giỏ hàng/đặt đơn, checkout success, chi tiết đơn.
- Cung cấp API cho admin sau này: CRUD menu, quản lý đơn, thống kê, QR cửa hàng, in lại bill.
- Hỗ trợ real-time đơn mới bằng SSE cho admin.
- Hỗ trợ thanh toán theo nghiệp vụ hiện tại: tiền mặt hoặc chuyển khoản VietQR; không tích hợp payment gateway/webhook ở MVP.
- Chuẩn bị tích hợp máy in nhiệt LAN TCP nhưng không để lỗi in làm fail đơn hàng.

### Phạm Vi Database

- PostgreSQL 16.
- Go API trong `apps/api`.
- SQL migrations, không dùng Prisma/ORM.
- UUID v7 sinh ở Go app layer, không dùng PostgreSQL extension.
- Dữ liệu lõi giai đoạn đầu:
  - Menu item.
  - Order.
  - Order item.
  - Customer info snapshot trên order.
  - Payment method/status.
  - Admin account từ `.env`, chưa cần bảng user.

### Điều Chỉnh Theo Repo Hiện Tại

- Repo đang dùng `pnpm`, không dùng Yarn v3 như `ANALYSIS.md`.
- Frontend nằm ở `apps/web/app`, không phải `src/app`.
- Backend nằm ở `apps/api`, cùng cấp với `apps/web`, viết bằng Go.
- Shared UI nằm trong `packages/ui`.
- Customer UI/PWA đã có sẵn mock data; BE cần đi theo hướng thay mock bằng API từng bước, không viết lại toàn bộ UI.
- Admin chưa triển khai; BE cần thiết kế để admin dùng lại sau.

## 2. Tài Liệu/Cấu Hình Cần Có

### Bắt Buộc Trước Khi Code BE

- Thông tin database local/dev:
  - `DATABASE_URL`.
  - user/password/db name cho PostgreSQL.
- Thông tin cửa hàng:
  - `NEXT_PUBLIC_STORE_NAME`.
  - `NEXT_PUBLIC_STORE_PHONE`.
  - `NEXT_PUBLIC_STORE_ADDRESS`.
- Thông tin thanh toán:
  - `STORE_BANK_ID`.
  - `STORE_BANK_ACCOUNT`.
  - `STORE_BANK_OWNER`.
  - Xác nhận dùng tiền mặt và chuyển khoản VietQR.
- Quy tắc đơn hàng:
  - Cho phép đặt hàng khi hết món hay không.
  - Trạng thái đơn cần dùng: `Pending`, `InProgress`, `Done`, `Cancelled` có cần `Cancelled` không.
  - Địa chỉ giao hàng là bắt buộc hay chỉ pickup tại quầy. — Đã chốt: hỗ trợ cả pickup và giao hàng.
- Seed menu ban đầu:
  - Tên món.
  - Nhóm món.
  - Giá.
  - Mô tả.
  - Ảnh.
  - Trạng thái còn/hết.

### Cần Cho Phase Admin/Deploy

- Admin username, admin email, session secret và SMTP config để gửi OTP.
- Domain production + HTTPS.
- IP máy in nhiệt và port TCP.
- Máy chủ deploy, registry, CI/CD variables nếu dùng GitLab.
- Chính sách lưu ảnh upload: local volume hay cloud storage.

## 3. Câu Hỏi Cần Xác Nhận

1. App này ưu tiên bán tại quầy pickup, giao hàng nội bộ, hay cả hai? — Đã chốt: hỗ trợ cả hai.
2. Thanh toán QR cuối cùng là MoMo, VietQR ngân hàng, hay cho chọn cả hai? — Đã chốt mới: chỉ tiền mặt và chuyển khoản VietQR.
3. Đơn hàng có cần trạng thái `Cancelled` không? — Đã chốt: có `Cancelled`.
4. Admin login dùng 1 tài khoản `.env` như `ANALYSIS.md`, hay cần nhiều nhân viên về sau?
5. Menu cần nhóm cố định `Bánh mì` / `Đồ uống`, hay có thể CRUD category?
6. Ảnh món giai đoạn đầu lưu local `/uploads` có đủ chưa?
7. Máy in nhiệt sẽ test trong LAN thật ở phase nào?
8. Hóa đơn online cần xuất `.txt`, PDF, hay lưu bản ghi invoice trong DB?

### Quyết Định Đã Chốt

- Payment production chỉ có `cash` và `vietqr`; `vietqr` hiển thị QR trong hóa đơn online khi xuất bill.
- Order status sẽ có `Cancelled`.
- Fulfillment sẽ hỗ trợ cả `pickup` và `delivery`.
- `Cancelled` là trạng thái kết thúc, admin có thể chuyển đơn sang trạng thái này khi khách hủy hoặc quán không thể phục vụ.
- VietQR được generate từ `STORE_BANK_ID`, `STORE_BANK_ACCOUNT`, `STORE_BANK_OWNER`, số tiền đơn hàng và short order id.
- Phí giao hàng cố định `20.000đ` cho mỗi đơn `delivery`; đơn `pickup` không tính phí giao hàng.
- Cart lưu bằng backend session qua HttpOnly cookie, không dùng localStorage cho dữ liệu cart chính.
- Checkout `delivery` bắt buộc tên, SĐT và địa chỉ; checkout `pickup` không bắt buộc tên/SĐT/địa chỉ.
- Admin login dùng username + OTP gửi email, OTP thay thế hoàn toàn mật khẩu.

## 4. Kiến Trúc Đề Xuất

### Runtime

- `apps/web`: Next.js PWA/customer UI, không sở hữu DB.
- `apps/api`: Go HTTP API, sở hữu business logic, DB access, migrations, seed.
- PostgreSQL chạy qua `docker-compose.yml` ở root.
- SQL migrations trong `apps/api/migrations`.
- Seed SQL trong `apps/api/seeds`.
- Web gọi Go API qua `NEXT_PUBLIC_API_URL`.

### API Customer

- `GET /api/menu`: lấy danh sách món còn/hết, filter category.
- `GET /api/menu/{slug}`: lấy chi tiết món.
- `POST /api/orders`: tạo đơn từ cart.
- `GET /api/orders/[id]`: lấy chi tiết đơn để success/track.
- `GET /api/payment/qr`: trả metadata QR theo order và payment method nếu cần.

### API Admin

- `POST /api/admin/menu`: tạo món.
- `PUT /api/admin/menu/[id]`: sửa món/toggle available.
- `DELETE /api/admin/menu/[id]`: xóa mềm hoặc xóa thật tùy xác nhận.
- `GET /api/admin/orders`: danh sách đơn.
- `PUT /api/admin/orders/[id]`: cập nhật trạng thái.
- `GET /api/admin/orders/stream`: SSE đơn mới.
- `POST /api/admin/print/[id]`: in lại bill.
- `GET /api/admin/stats`: thống kê ngày.

### Database Models Tối Thiểu

- `menu_items`
  - `id`, `name`, `slug`, `category`, `price`, `image_url`, `description`, `detail`, `available`, `sort_order`, timestamps.
- `orders`
  - `id`, `status`, `fulfillment_type`, `payment_method`, `payment_status`, `customer_name`, `phone`, `address`, `note`, `subtotal`, `shipping_fee`, `discount`, `total_price`, timestamps.
- `order_items`
  - `id`, `order_id`, `menu_item_id`, `name_snapshot`, `unit_price`, `quantity`, `note`, `line_total`.
- `cart_sessions`
  - `id`, `created_at`, `updated_at`, `expires_at`.
- `cart_items`
  - `id`, `cart_session_id`, `menu_item_id`, `quantity`, `note`, timestamps.

### Nguyên Tắc Dữ Liệu

- Giá trị tiền lưu bằng `Int` VND, không lưu string `32.000đ`.
- `OrderItem` lưu snapshot tên/giá để hóa đơn không bị đổi khi admin sửa menu.
- Không xóa hard menu item đã có order nếu chưa xác nhận; ưu tiên `Available=false`.
- API validate input bằng schema rõ ràng trước khi ghi DB.
- Tạo order và order items trong transaction.

## 5. Phase Triển Khai

### Phase 0 — Chốt Quyết Định Và Chuẩn Bị

- Chốt câu hỏi nghiệp vụ ở mục 3.
- Chốt dùng PostgreSQL local bằng Docker Compose.
- Chốt payment method trên UI/API: `cash`, `vietqr`; VietQR là QR production cần triển khai.
- Chốt order status: `pending`, `in_progress`, `done`, `cancelled`.
- Chốt fulfillment type: `pickup`, `delivery`.
- Chốt backend Go đặt tại `apps/api`, tách khỏi `apps/web`.
- Cập nhật `.env.example`.

### Phase 1 — Go API Và Database Foundation

- Tạo Go module trong `apps/api`.
- Cài PostgreSQL driver `pgx`.
- Tạo SQL migration đầu tiên.
- Enum DB ban đầu có `cash`, `momo`, `vietqr`; API/UI chỉ cho phép `cash`, `vietqr` từ flow mới.
- Tạo DB connection pool.
- Tạo UUID v7 helper ở Go app layer.
- Tạo migration runner đơn giản.
- Tạo seed menu.
- Tạo API skeleton và health checks.

### Phase 2 — Customer Read APIs

- Implement `GET /api/menu`.
- Implement `GET /api/menu/{slug}`.
- Chuẩn hóa DTO trả về cho UI hiện tại.
- Thay `mock-data.ts` ở menu/product detail bằng API fetch từng bước.
- `apps/web` chỉ giữ public env như `NEXT_PUBLIC_API_URL`; DB/payment/admin secret nằm ở `apps/api`.

### Phase 3 — Order APIs

- Implement `POST /api/orders`.
- Validate cart items, quantity, note, customer info, payment method (`cash` hoặc `vietqr`).
- Validate fulfillment type; nếu `delivery` thì tên, SĐT và địa chỉ bắt buộc, nếu `pickup` thì các thông tin này có thể rỗng.
- Recalculate price từ DB, không tin total từ client.
- Nếu `delivery`, áp dụng phí giao hàng cố định `20.000đ`; nếu `pickup`, phí giao hàng là `0đ`.
- Tạo order transaction.
- Implement `GET /api/orders/[id]`.
- Success page đọc order thật.

### Phase 4 — Cart/Checkout Integration

- Tạo cart client gọi backend session cart.
- Cart page dùng cart thật thay mock.
- Checkout submit gọi `POST /api/orders`.
- Checkout cho chọn `Nhận tại quầy` hoặc `Giao hàng`.
- Checkout chỉ bắt buộc địa chỉ khi chọn `Giao hàng`.
- Redirect sang success theo order id.
- Invoice export dùng order thật.

### Phase 5 — Admin Auth Foundation

- Cấu hình admin auth ở Go API bằng username + OTP email + HttpOnly signed session cookie.
- Admin username/email từ `.env`; OTP gửi qua SMTP nếu cấu hình, nếu chưa cấu hình thì log ra terminal dev.
- Web admin gọi Go API với auth token/session.
- Tạo route request OTP, verify OTP, logout, me theo strategy Go API session.

### Phase 6 — Admin Menu

- CRUD menu.
- Toggle còn/hết.
- Upload ảnh local `/uploads`.
- Serve ảnh qua API hoặc static route.

### Phase 7 — Admin Orders Và SSE

- Danh sách đơn.
- Cập nhật trạng thái hai chiều.
- SSE stream cho đơn mới.
- Beep khi có đơn mới.
- Chuẩn bị hook in bill tự động.

### Phase 8 — Printing Và Payment QR

- Tạo service build nội dung bill.
- Tạo helper build VietQR URL từ bank id, account, amount và short order id.
- Tạo QR payment theo method đã chốt; VietQR dùng cho production và chỉ hiển thị trong hóa đơn online khi xuất bill.
- Tích hợp printer LAN TCP bằng safe wrapper.
- API in lại bill.
- Test thực tế với máy in.

### Phase 9 — Stats, QR Cửa Hàng, Hardening

- API thống kê theo ngày.
- Admin QR trỏ tới `/menu`.
- Rate limit cơ bản cho order API nếu cần.
- Logging lỗi DB/printer.
- Build production và kiểm tra Docker.

## 6. Rủi Ro Kỹ Thuật

- Next.js 16 chỉ áp dụng cho frontend; trước khi sửa UI/routes trong `apps/web` vẫn cần đọc docs trong `node_modules/next/dist/docs`.
- Go API tách riêng nên không dùng Next.js API routes làm backend chính.
- Printer LAN không test được nếu không có thiết bị và cùng mạng.
- Payment QR production dùng VietQR thật theo thông tin ngân hàng đã xác nhận.
- Nếu dùng local upload, deploy phải mount volume để không mất ảnh.
- SSE trên serverless có thể không ổn định; cần deploy runtime hỗ trợ long-lived connection.

## 7. Definition Of Done Cho BE/DB MVP

- Menu đọc từ PostgreSQL thông qua Go API.
- Tạo đơn từ checkout qua Go API và lưu DB bằng transaction.
- Success page hiển thị order thật từ Go API.
- Hóa đơn online xuất từ order thật.
- Admin có thể xem đơn mới và đổi trạng thái.
- Seed chạy lại được trên môi trường mới.
- `lint`, `typecheck`, `build` pass.
