# Breadify API

Go backend cho Breadify. App này nằm cùng cấp với `apps/web` và sở hữu database, migrations, seed, API.

## Local

```bash
cd apps/api
copy .env.example .env
go mod tidy
go run ./cmd/migrate
go run ./cmd/seed
go run ./cmd/api
```

API mặc định chạy ở `http://localhost:8080`.

## Endpoints hiện có

- `GET /healthz`
- `GET /readyz`
- `GET /api/menu`
- `GET /api/menu?category=banh_mi`
- `GET /api/menu/{slug}`
