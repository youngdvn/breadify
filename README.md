# Breadify

Breadify là monorepo cho ứng dụng đặt bánh mì/đồ uống, gồm storefront PWA bằng Next.js và Go API riêng để quản lý menu, giỏ hàng, đơn hàng, admin auth và dữ liệu PostgreSQL.

## Tổng Quan

- `apps/web`: Next.js 16 App Router, React 19, PWA storefront và admin UI.
- `apps/api`: Go HTTP API, sở hữu database, migrations, seed và business logic.
- `packages/ui`: shared UI components theo shadcn/ui, Tailwind CSS 4.
- `packages/eslint-config`: ESLint config dùng chung.
- `packages/typescript-config`: TypeScript config dùng chung.
- `docs`: kế hoạch backend/database và ghi chú cấu hình admin OTP.

## Tính Năng Hiện Có

- Storefront đọc menu thật từ Go API/PostgreSQL.
- Giỏ hàng backend session bằng HttpOnly cookie.
- Checkout hỗ trợ `pickup` và `delivery`.
- Thanh toán hỗ trợ `cash` và `vietqr`.
- Đơn delivery có phí giao hàng cố định `20.000đ`.
- Tạo đơn từ cart bằng transaction và lưu snapshot item/giá.
- Trang success, chi tiết đơn và xuất invoice dùng order thật.
- PWA manifest, app icons, service worker và trang offline.
- Admin login bằng `username -> OTP email`, session cookie ký HMAC.
- Admin shell và các route admin placeholder cho orders/menu/QR.

## Công Nghệ Chính

- Node.js `>=20`
- pnpm `10.33.4`
- Turbo `2`
- Next.js `16.2.6`
- React `19.2.4`
- TypeScript `5`
- Go `1.23`
- PostgreSQL `16`

## Cài Đặt Local

### 1. Cài dependencies

```bash
pnpm install
```

Nếu dùng Corepack:

```bash
corepack enable
corepack pnpm install
```

### 2. Tạo file môi trường

```powershell
Copy-Item apps\web\.env.example apps\web\.env.local
Copy-Item apps\api\.env.example apps\api\.env
```

Trên macOS/Linux:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

### 3. Chạy PostgreSQL

```bash
docker compose up -d postgres
```

Database mặc định:

- Host: `localhost:5432`
- User: `breadify`
- Password: `breadify_secret`
- Database: `breadify`
- URL: `postgres://breadify:breadify_secret@localhost:5432/breadify?sslmode=disable`

### 4. Chạy migration và seed

```bash
cd apps/api
go run ./cmd/migrate
go run ./cmd/seed
```

### 5. Chạy API

```bash
cd apps/api
go run ./cmd/api
```

API mặc định chạy tại `http://localhost:8080`.

### 6. Chạy web

Ở terminal khác:

```bash
pnpm --filter web dev
```

Web mặc định chạy tại `http://localhost:3000`.

## Biến Môi Trường

### Web: `apps/web/.env.local`

```env
NEXT_PUBLIC_STORE_NAME="Breadify"
NEXT_PUBLIC_STORE_PHONE="0383958932"
NEXT_PUBLIC_STORE_ADDRESS="Thủ Đức, TP.HCM"
NEXT_PUBLIC_API_URL="http://localhost:8080"
```

Theo quy ước Next.js, biến dùng trong browser phải có prefix `NEXT_PUBLIC_`.

### API: `apps/api/.env`

```env
PORT=8080
DATABASE_URL=postgres://breadify:breadify_secret@localhost:5432/breadify?sslmode=disable
WEB_ORIGIN=http://localhost:3000

STORE_NAME=Breadify
STORE_PHONE=0383958932
STORE_ADDRESS=Thủ Đức, TP.HCM
STORE_BANK_ID=VCB
STORE_BANK_ACCOUNT=0383958932
STORE_BANK_OWNER=BREADIFY

ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@breadify.vn
ADMIN_SESSION_SECRET=replace-with-a-random-long-secret
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Nếu `SMTP_HOST` để trống, OTP admin sẽ được log ra terminal API thay vì gửi email thật. Xem thêm `docs/ADMIN_EMAIL_OTP.md`.

## Scripts

Chạy từ root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
```

Chạy riêng web:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web typecheck
```

Chạy riêng API:

```bash
cd apps/api
go run ./cmd/api
go run ./cmd/migrate
go run ./cmd/seed
go test ./...
```

## API Endpoints

### Health

- `GET /healthz`
- `GET /readyz`

### Menu

- `GET /api/menu`
- `GET /api/menu?category=banh_mi`
- `GET /api/menu/{slug}`

### Cart

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/{id}`
- `DELETE /api/cart/items/{id}`
- `DELETE /api/cart`

### Orders

- `POST /api/orders`
- `GET /api/orders/{id}`

### Admin Auth

- `POST /api/admin/auth/otp/request`
- `POST /api/admin/auth/otp/verify`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`

## Cấu Trúc Thư Mục

```txt
.
├── apps
│   ├── api
│   │   ├── cmd
│   │   │   ├── api
│   │   │   ├── migrate
│   │   │   └── seed
│   │   ├── internal
│   │   │   ├── config
│   │   │   ├── db
│   │   │   ├── httpserver
│   │   │   └── id
│   │   ├── migrations
│   │   └── seeds
│   └── web
│       ├── app
│       ├── components
│       ├── services
│       ├── types
│       ├── utils
│       └── public
├── packages
│   ├── eslint-config
│   ├── typescript-config
│   └── ui
└── docs
```

## Ghi Chú Phát Triển

- Frontend dùng Next.js 16 App Router trong `apps/web/app`; trước khi sửa route/UI Next.js, đọc guide tương ứng trong `node_modules/next/dist/docs/`.
- Backend chính là Go API trong `apps/api`; không dùng Next.js API routes để sở hữu database.
- Migrations chạy theo thứ tự `apps/api/migrations/*.up.sql` và lưu lịch sử vào bảng `schema_migrations`.
- Seed SQL nằm trong `apps/api/seeds`.
- Cart và admin auth dùng cookie, nên API cần `WEB_ORIGIN` đúng với origin của web để CORS gửi credential.
- `NEXT_PUBLIC_API_URL` được web dùng để gọi API từ client và server components.

## Tài Liệu Liên Quan

- `apps/api/README.md`: ghi chú nhanh cho Go API.
- `docs/BE_DB_PHASES.md`: kế hoạch triển khai backend/database.
- `docs/BE_DB_CHECKLIST.md`: checklist tiến độ backend/database.
- `docs/ADMIN_EMAIL_OTP.md`: cấu hình admin login bằng OTP email.
