# Hệ thống Order QR — Breadify

> **Stack:** Next.js 16 · TypeScript · Prisma · PostgreSQL 16 · shadcn/ui · Tailwind CSS v4 · Axios · Context API
> **Docs:** context7 MCP để đọc tài liệu Next.js 16 mới nhất trong quá trình phát triển

---

## 1. Thông tin quán

```
NEXT_PUBLIC_STORE_NAME    = "Breadify"
NEXT_PUBLIC_STORE_PHONE   = "0383958932"
NEXT_PUBLIC_STORE_ADDRESS = "Thủ Đức, TPHCM"
STORE_BANK_ID             = "Vietcombank"
STORE_BANK_ACCOUNT        = "0383958932"
STORE_BANK_OWNER          = "BEADIFY"
```

---

## 2. Phân tích nghiệp vụ

### Luồng hoạt động

**1 mã QR duy nhất** dán tại quầy — mọi khách quét cùng 1 QR, không phân biệt bàn.
App deploy lên **public domain có HTTPS**, khách không cần vào WiFi quán.

```
Khách hàng                     Next.js 16 App                   Quầy thu ngân
     │                              │                                 │
     │── Quét QR tại quầy ───────>  │                                 │
     │<─ Redirect → /menu ─────────│                                 │
     │── Chọn món, ghi chú ──────>  │                                 │
     │── Bấm "Đặt ngay" ─────────>  │── POST /api/orders ────────────>│
     │                              │── Lưu DB (PostgreSQL)          │
     │<─ /success/[OrderId] ───────  │── In bill nhiệt TỰ ĐỘNG ──────> Xprinter XP-58 (LAN)
     │<─ Hiển thị VietQR trên bill  │                                 │
     │   → khách chuyển khoản hoặc  │                                 │
     │     trả tiền mặt tại quầy    │                                 │
     │                              │                                 │
     │                         [Admin tablet]                         │
     │                         SSE: đơn mới hiện real-time ──────────│
```

**Thanh toán:**

- Bill nhiệt in ra có **VietQR** (QR chuyển khoản ngân hàng)
- Khách quét QR → chuyển khoản đúng số tiền tự động
- Hoặc trả tiền mặt tại quầy
- Không tích hợp payment gateway — không cần webhook/callback

**3 actor:**

- **Khách hàng** — quét QR, chọn món, ghi chú, gửi đơn qua mobile
- **Nhân viên quầy** — nhận bill nhiệt in tự động, chuẩn bị món
- **Admin (1 tài khoản)** — quản lý menu, xem đơn real-time, xem thống kê

---

## 3. Danh sách màn hình

### Khách hàng — Mobile Web (ưu tiên giai đoạn này)

| #   | Route                | Module      | Mô tả                                           |
| --- | -------------------- | ----------- | ----------------------------------------------- |
| 1   | `/menu`              | **Menu**    | Danh sách món theo nhóm, giỏ hàng sticky footer |
| 2   | `/cart`              | **Cart**    | Xem lại đơn, ghi chú từng món, chỉnh số lượng   |
| 3   | `/success/[OrderId]` | **Success** | Xác nhận đơn + hiện VietQR thanh toán           |

### Admin — Mobile + Tablet + Desktop (fully responsive)

| #   | Route           | Module          | Mô tả                                       |
| --- | --------------- | --------------- | ------------------------------------------- |
| 4   | `/admin/login`  | **AdminLogin**  | Đăng nhập — 1 tài khoản từ `.env`           |
| 5   | `/admin/menu`   | **AdminMenu**   | CRUD món ăn, toggle còn/hết hàng            |
| 6   | `/admin/orders` | **AdminOrders** | Danh sách đơn real-time (SSE)               |
| 7   | `/admin/stats`  | **AdminStats**  | Thống kê ngày, biểu đồ, top món             |
| 8   | `/admin/qr`     | **AdminQr**     | Xem & tải QR dán quầy (trỏ đến domain thật) |

### Phase 2

| #   | Route              | Module         | Mô tả                              |
| --- | ------------------ | -------------- | ---------------------------------- |
| 9   | `/order`           | **PreOrder**   | Đặt trước: nhập tên, SĐT, giờ lấy  |
| 10  | `/track/[OrderId]` | **TrackOrder** | Khách xem trạng thái đơn đặt trước |

---

## 4. Tính năng chi tiết

### Menu (khách hàng)

- Hiển thị món theo nhóm: **Bánh mì** / **Đồ uống** (2 nhóm cố định, enum)
- Card mỗi món: ảnh, tên, giá, nút `+` / `−`
- Món hết hàng: card mờ (opacity-40, grayscale), badge "Hết", nút disabled
- Floating cart button sticky footer — hiện số lượng + tổng tiền
- State giỏ hàng dùng **GlobalCartContext** — persist khi navigate sang `/cart`

### Cart (khách hàng)

- Stepper chỉnh số lượng / xoá từng dòng
- Input ghi chú riêng từng món (ít ớt, không rau…)
- Tổng tiền tự tính
- Nút "Đặt ngay" → axios POST → redirect `/success/[OrderId]`

### Success (khách hàng)

- Hiển thị **VietQR** để khách chuyển khoản (tên TK, ngân hàng, số tiền tự điền)
- Order ID rút gọn: 8 ký tự cuối UUID v7 in hoa, vd `A1B2C3D4`
- Nút "Đặt thêm" → quay lại `/menu`, xóa cart

### AdminMenu

- Danh sách món + filter theo nhóm
- Inline toggle "Còn / Hết hàng" không reload
- Dialog thêm/sửa: tên, nhóm, giá, upload ảnh, mô tả
- Ảnh lưu local `/uploads`, phục vụ qua Next.js API route

### AdminOrders

- SSE push đơn mới real-time
- **Phát âm thanh beep** khi SSE nhận đơn mới (`/public/sounds/NewOrder.mp3`)
- Card đơn: short ID, giờ đặt, món + ghi chú, tổng tiền
- Badge trạng thái **hai chiều**: `Mới ↔ Đang làm ↔ Xong` — admin bấm được cả tiến lẫn lùi
- **Tự động in bill** khi nhận đơn — không cần thao tác tay
- Nút in lại bill dự phòng

### AdminStats

- Tổng đơn / doanh thu / số món hôm nay
- Biểu đồ cột theo giờ (shadcn Chart)
- Top 5 món bán chạy, date picker xem lịch sử

### AdminQr

- QR trỏ đến `https://<domain>/menu`
- Tải PNG độ phân giải cao để in dán quầy

---

## 5. Mockup UI (Mobile-first — 390px base)

### Screen 1 — MenuPage

```
┌─────────────────────────┐  bg-amber-50, max-w-md mx-auto
│ ┌─────────────────────┐ │
│ │  🍞 Bánh Mì Palette │ │  Header: bg-amber-500, text-white
│ │   Nunito ExtraBold  │ │  h-14, sticky top-0 z-50
│ └─────────────────────┘ │
│ ┌──────────┬──────────┐ │  shadcn Tabs: sticky top-14 z-40
│ │ Bánh Mì  │ Đồ Uống  │ │  Active: border-b-2 border-amber-500
│ └──────────┴──────────┘ │
│                         │
│  BÁNH MÌ                │  text-xs uppercase text-gray-400 px-4
│ ┌─────────────────────┐ │
│ │[IMG]  Bánh mì thịt  │ │  Card: bg-white rounded-2xl shadow-sm
│ │       25.000đ       │ │  flex gap-3 p-3 mx-4 mb-3
│ │          [− 1  +]   │ │  Stepper: bg-amber-50 rounded-full
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │[IMG]  Bánh mì trứng │ │
│ │       22.000đ       │ │
│ │          [− 0  +]   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │  Hết hàng: opacity-40 grayscale
│ │[IMG]  Bánh pate     │ │
│ │       [HẾT HÀNG]   │ │  Badge: bg-red-100 text-red-600
│ └─────────────────────┘ │
│                         │  pb-24 (safe area cho footer)
├─────────────────────────┤  sticky bottom-0
│ 🛒  2 món · 45.000đ  → │  bg-amber-500 text-white h-16
│                         │  rounded-t-2xl Nunito Bold
└─────────────────────────┘
```

### Screen 2 — CartPage

```
┌─────────────────────────┐
│ ←  Đơn của bạn          │  bg-amber-500 text-white h-14
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Bánh mì thịt  [×]   │ │  bg-white rounded-2xl mx-4 mb-3 p-4
│ │ 25.000đ  [−][1][+]  │ │  × xoá: text-gray-300
│ │ ✏ [ít ớt, không rau]│ │  Input: border-amber-200 rounded-lg
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Trà tắc       [×]   │ │
│ │ 15.000đ  [−][2][+]  │ │
│ │ ✏ [ít đá          ] │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Tổng cộng:   55.000đ   │  font-extrabold text-xl text-amber-700
│ [      ĐẶT NGAY      ] │  bg-amber-500 h-14 rounded-2xl mx-4
└─────────────────────────┘
```

### Screen 3 — SuccessPage (có VietQR)

```
┌─────────────────────────┐  bg-amber-50
│                         │
│        ✅               │  w-20 h-20 bg-green-100 rounded-full
│                         │
│  Đặt hàng thành công!   │  text-2xl font-extrabold text-amber-700
│                         │
│ ┌───────────────────┐   │
│ │  Đơn #A1B2C3D4   │   │  bg-white rounded-2xl shadow p-4 mx-4
│ │  Tổng: 55.000đ   │   │  border border-amber-100
│ │  ─────────────── │   │
│ │  [  QR IMAGE  ]  │   │  VietQR: 160×160px
│ │  Chuyển khoản    │   │  text-sm text-gray-500 text-center
│ │  hoặc trả tiền   │   │
│ │  mặt tại quầy   │   │
│ └───────────────────┘   │
│                         │
│ [    Đặt thêm món    ]  │  variant="outline" border-amber-400
└─────────────────────────┘
```

### Admin Navigation — Responsive pattern

```
Mobile (< 768px)           Tablet/Desktop (≥ 768px)
┌─────────────────────┐    ┌──────┬──────────────────────┐
│  [Content area]     │    │ Side │   [Content area]     │
│                     │    │  bar │                      │
│                     │    │ Menu │                      │
│                     │    │Order │                      │
│                     │    │Stats │                      │
│                     │    │  QR  │                      │
├─────────────────────┤    └──────┴──────────────────────┘
│ 🍞  📋  📊  📱     │    Sidebar: bg-amber-800, w-56
│Menu Order Stats QR  │    fixed left, icon + label
└─────────────────────┘
Bottom tab: bg-amber-800, text-white
icon + label 4 tab
```

### Screen 4 — AdminOrders (Mobile)

```
┌─────────────────────────┐
│ ☰  Đơn hàng  🟢 Live   │  bg-amber-800 text-white h-14
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ #A1B2C3D4  08:32    │ │  bg-white rounded-2xl mx-4 mb-3
│ │ 🔴 Mới              │ │  border-l-4 border-red-500
│ │ ─────────────────── │ │
│ │ • Bánh mì thịt x1   │ │
│ │   (ít ớt)           │ │
│ │ • Trà tắc x2        │ │
│ │ ─────────────────── │ │
│ │ 40.000đ             │ │  font-bold text-amber-700
│ │ [→ Đang làm] [🖨]   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ #B2C3D4E5  08:28    │ │  border-l-4 border-amber-400
│ │ 🟡 Đang làm         │ │
│ │ • Bánh mì trứng x1  │ │
│ │ 22.000đ [→ Xong][🖨]│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 6. Hệ màu sắc — Bánh Mì Palette

```
Nguyên liệu      Màu               Hex        Tailwind       Dùng cho
───────────────────────────────────────────────────────────────────────
Vỏ bánh mì       Vàng (primary)    #F59E0B    amber-500      CTA, header, active
Bơ               Vàng nhạt         #FCD34D    amber-300      hover, border
Dưa leo          Xanh lá đậm       #16A34A    green-600      badge "Còn hàng"
Ngò rí           Xanh lá nhạt      #4ADE80    green-400      success, checkmark
Ớt               Đỏ                #DC2626    red-600        badge "Hết", lỗi
Pate             Xám               #6B7280    gray-500       text phụ, placeholder
Ruột bánh (nền)  Kem               #FFFBEB    amber-50       page background
Vỏ nâu           Nâu đậm           #92400E    amber-800      heading, admin header
```

```css
/* src/app/globals.css */
:root {
  --background: 48 100% 97%; /* amber-50  */
  --primary: 38 92% 50%; /* amber-500 */
  --primary-foreground: 0 0% 100%;
  --destructive: 0 72% 51%; /* red-600   */
  --muted: 220 9% 46%; /* gray-500  */
  --border: 43 96% 85%;
  --radius: 1rem;
}
```

---

## 6b. Tailwind CSS v4 + shadcn/ui Setup

### Tại sao phải setup thủ công

`create-next-app --tailwind` cài Tailwind v3 mặc định. Dự án dùng **Tailwind v4** (CSS-first config, không có `tailwind.config.js`). Phải upgrade + cấu hình lại.

### Bước 1 — Cài Tailwind v4

```bash
yarn add tailwindcss@latest @tailwindcss/postcss@latest postcss@latest
yarn remove autoprefixer   # v4 không cần autoprefixer nữa
```

### Bước 2 — `postcss.config.mjs`

```js
// postcss.config.mjs
const Config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
export default Config
```

### Bước 3 — `src/app/globals.css` (thay thế toàn bộ)

Tailwind v4 dùng `@import "tailwindcss"` thay cho `@tailwind base/components/utilities`.
Theme và màu sắc định nghĩa trong CSS bằng `@theme`.

```css
@import "tailwindcss";

/* ── Bánh Mì Palette — CSS Variables ─────────────────────── */
:root {
  --background: 48 100% 97%; /* amber-50  #FFFBEB */
  --foreground: 30 50% 15%;
  --primary: 38 92% 50%; /* amber-500 #F59E0B */
  --primary-foreground: 0 0% 100%;
  --secondary: 43 96% 56%; /* amber-300 #FCD34D */
  --secondary-foreground: 30 50% 15%;
  --destructive: 0 72% 51%; /* red-600   #DC2626 */
  --destructive-foreground: 0 0% 100%;
  --muted: 220 9% 46%; /* gray-500  #6B7280 */
  --muted-foreground: 220 9% 46%;
  --card: 0 0% 100%;
  --card-foreground: 30 50% 15%;
  --border: 43 96% 85%;
  --input: 43 96% 85%;
  --ring: 38 92% 50%;
  --radius: 1rem;
}

/* ── Tailwind v4 Theme Extension ──────────────────────────── */
@theme inline {
  --font-sans: var(--font-nunito);

  /* Map CSS vars → Tailwind tokens */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
  --color-destructive: hsl(var(--destructive));
  --color-muted: hsl(var(--muted));
  --color-border: hsl(var(--border));
  --color-card: hsl(var(--card));

  /* Bánh Mì Palette custom tokens */
  --color-banh-mi: #f59e0b; /* vỏ bánh — primary */
  --color-bo: #fcd34d; /* bơ */
  --color-dua-leo: #16a34a; /* dưa leo */
  --color-ngo: #4ade80; /* ngò rí */
  --color-ot: #dc2626; /* ớt */
  --color-pate: #6b7280; /* pate */
  --color-nen: #fffbeb; /* nền ruột bánh */
  --color-vo-nau: #92400e; /* vỏ nâu admin */

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
}

/* ── Base styles ───────────────────────────────────────────── */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background font-sans text-foreground;
    -webkit-font-smoothing: antialiased;
  }
  /* Safe area cho mobile */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .mb-safe {
    margin-bottom: env(safe-area-inset-bottom);
  }
}
```

### Bước 4 — Init shadcn với Tailwind v4

```bash
npx shadcn@latest init
```

Chọn:

- Style: **Default**
- Base color: **Neutral** (sẽ override màu trong globals.css)
- CSS variables: **Yes**

Sau đó **xoá phần màu mà shadcn tự sinh** trong `globals.css` và thay bằng Bánh Mì Palette ở Bước 3.

### Bước 5 — Thêm shadcn components

```bash
npx shadcn@latest add button card badge input label textarea
npx shadcn@latest add dialog alert-dialog sheet
npx shadcn@latest add tabs skeleton separator scroll-area
npx shadcn@latest add sonner
npx shadcn@latest add chart
npx shadcn@latest add table
```

### Bước 6 — Kiểm tra

```tsx
// Tạo file test tạm: src/app/test/page.tsx
import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"

export default function TestPage() {
  return (
    <div className="p-8 bg-nen min-h-screen">
      <h1 className="text-3xl font-extrabold text-vo-nau mb-4">Bánh Mì Palette</h1>
      <div className="flex gap-3">
        <Button className="bg-banh-mi hover:bg-bo text-white">Đặt ngay</Button>
        <Badge className="bg-dua-leo text-white">Còn hàng</Badge>
        <Badge className="bg-ot text-white">Hết hàng</Badge>
      </div>
    </div>
  )
}
```

Mở `localhost:3000/test` — xác nhận màu sắc và font Nunito hiển thị đúng trước khi xoá file test.

---

## 7. Typography

```typescript
// src/app/layout.tsx
import { Nunito } from "next/font/google"

const NunitoFont = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
})
```

---

## 8. Stack công nghệ

| Layer               | Công nghệ                         | Ghi chú                                                          |
| ------------------- | --------------------------------- | ---------------------------------------------------------------- |
| **Framework**       | Next.js 16 App Router             | `output: "standalone"`, dùng context7 để đọc docs                |
| **Language**        | TypeScript strict                 | PascalCase toàn bộ                                               |
| **UI Library**      | **shadcn/ui duy nhất**            | Tailwind CSS v4, kể cả Chart, Toast (Sonner), Skeleton           |
| **Font**            | Nunito via `next/font/google`     | Subset latin + vietnamese                                        |
| **HTTP Client**     | **Axios**                         | 1 `AxiosClient` singleton, interceptor tập trung                 |
| **State/Logic**     | **Context API**                   | `GlobalCartContext` + Context riêng mỗi module                   |
| **Database**        | PostgreSQL 16 (Docker)            | Extension `uuidv7` npm generate UUID v7 tại app layer            |
| **ORM**             | Prisma 6                          | Migration, type-safe query                                       |
| **Primary Key**     | **UUID v7**                       | Generate bằng npm `uuidv7`, không phụ thuộc PostgreSQL extension |
| **Real-time**       | Server-Sent Events                | Push đơn mới → admin                                             |
| **Auth**            | NextAuth.js v5 (credentials)      | 1 tài khoản từ `.env`, `proxy.ts` bảo vệ `/admin/*`              |
| **Máy in**          | node-escpos + network             | Xprinter XP-58 kết nối LAN qua TCP socket                        |
| **Payment**         | VietQR (static)                   | In QR chuyển khoản lên bill nhiệt — không cần payment gateway    |
| **QR Generator**    | `qrcode` npm                      | QR menu dán quầy                                                 |
| **VietQR**          | `vietqr` URL template             | Generate URL hình ảnh QR chuyển khoản                            |
| **Image upload**    | Next.js API route + Docker volume | Lưu `/uploads`, mount volume                                     |
| **Toast**           | shadcn Sonner                     | Thông báo lỗi/thành công toàn app                                |
| **Package manager** | **Yarn v3 (Berry)**               | `.yarnrc.yml`, node-modules linker                               |
| **Container**       | Docker Compose                    | App + Db cùng `BanhMiNetwork`                                    |
| **CI/CD**           | **GitLab CI/CD Runner**           | Validate → Build image → Deploy SSH                              |
| **AI Dev**          | context7 MCP + Claude Code Skills | Đọc docs Next.js 16, review, verify, security                    |

---

## 9. Nguyên tắc kiến trúc code

### A. 2 lớp Context

**Lớp 1 — GlobalCartContext** (bọc toàn app, share giữa mọi module)

```
app/layout.tsx
└── GlobalCartProvider        ← CartItems, AddToCart, RemoveFromCart, UpdateNote, TotalPrice
    ├── /menu → MenuPage
    │   └── MenuProvider      ← MenuItems, IsLoading, fetch /api/menu
    ├── /cart → CartPage
    │   └── CartProvider      ← SubmitOrder, IsSubmitting (dùng GlobalCartContext)
    └── /success → SuccessPage
```

**Lớp 2 — Module Context** (logic riêng của từng màn hình)

- `MenuContext` — fetch danh sách món, quản lý loading
- `CartContext` — submit đơn, navigate sau khi đặt
- `SuccessContext` — fetch chi tiết đơn để hiển thị VietQR
- `AdminOrdersContext` — SSE listener, update trạng thái, trigger in bill
- v.v.

### B. Module structure — mỗi màn hình là 1 module độc lập

```
src/modules/
├── Menu/
│   ├── MenuContext.tsx        ← logic, state, axios call
│   ├── MenuPage.tsx           ← bọc Provider + dynamic import components
│   └── components/
│       ├── MenuCard.tsx       ← UI only, gọi { AddToCart } = UseGlobalCart()
│       ├── MenuHeader.tsx
│       ├── CategoryTabs.tsx
│       └── CartFooter.tsx
├── Cart/
│   ├── CartContext.tsx
│   ├── CartPage.tsx
│   └── components/
│       └── CartItem.tsx
├── Success/
│   ├── SuccessContext.tsx
│   ├── SuccessPage.tsx
│   └── components/
│       ├── OrderBadge.tsx
│       └── VietQrCard.tsx
├── AdminMenu/
│   ├── AdminMenuContext.tsx
│   ├── AdminMenuPage.tsx
│   └── components/
│       ├── MenuTable.tsx
│       ├── MenuFormDialog.tsx
│       └── AvailableToggle.tsx
├── AdminOrders/
│   ├── AdminOrdersContext.tsx
│   ├── AdminOrdersPage.tsx
│   └── components/
│       ├── OrderCard.tsx
│       └── StatusBadge.tsx
├── AdminStats/
│   ├── AdminStatsContext.tsx
│   ├── AdminStatsPage.tsx
│   └── components/
│       ├── StatCard.tsx
│       ├── OrdersChart.tsx
│       └── TopItemsTable.tsx
├── AdminQr/
│   ├── AdminQrContext.tsx
│   ├── AdminQrPage.tsx
│   └── components/
│       └── QrDisplay.tsx
└── AdminLogin/
    ├── AdminLoginContext.tsx
    ├── AdminLoginPage.tsx
    └── components/
        └── LoginForm.tsx
```

### C. Pattern Context — logic tách hoàn toàn khỏi UI

```typescript
// src/context/GlobalCartContext.tsx
"use client"
import { createContext, useContext, useState } from "react"

interface CartItem {
  MenuItemId: string
  Name:       string
  UnitPrice:  number
  Quantity:   number
  Note:       string
}

interface GlobalCartContextType {
  CartItems:      CartItem[]
  AddToCart:      (Item: Omit<CartItem, "Quantity" | "Note">) => void
  RemoveFromCart: (MenuItemId: string) => void
  UpdateNote:     (MenuItemId: string, Note: string) => void
  GetQuantity:    (MenuItemId: string) => number
  TotalPrice:     number
  TotalCount:     number
  ClearCart:      () => void
}

const GlobalCartContext = createContext<GlobalCartContextType | null>(null)

export function GlobalCartProvider({ children }: { children: React.ReactNode }) {
  const [CartItems, SetCartItems] = useState<CartItem[]>([])

  const AddToCart = (Item: Omit<CartItem, "Quantity" | "Note">): void => {
    SetCartItems(Prev => {
      const Existing = Prev.find(I => I.MenuItemId === Item.MenuItemId)
      if (Existing) return Prev.map(I =>
        I.MenuItemId === Item.MenuItemId ? { ...I, Quantity: I.Quantity + 1 } : I
      )
      return [...Prev, { ...Item, Quantity: 1, Note: "" }]
    })
  }

  const RemoveFromCart = (MenuItemId: string): void => {
    SetCartItems(Prev => {
      const Existing = Prev.find(I => I.MenuItemId === MenuItemId)
      if (Existing?.Quantity === 1) return Prev.filter(I => I.MenuItemId !== MenuItemId)
      return Prev.map(I =>
        I.MenuItemId === MenuItemId ? { ...I, Quantity: I.Quantity - 1 } : I
      )
    })
  }

  const UpdateNote = (MenuItemId: string, Note: string): void =>
    SetCartItems(Prev => Prev.map(I => I.MenuItemId === MenuItemId ? { ...I, Note } : I))

  const GetQuantity = (MenuItemId: string): number =>
    CartItems.find(I => I.MenuItemId === MenuItemId)?.Quantity ?? 0

  const TotalPrice = CartItems.reduce((Sum, I) => Sum + I.UnitPrice * I.Quantity, 0)
  const TotalCount = CartItems.reduce((Sum, I) => Sum + I.Quantity, 0)
  const ClearCart = (): void => SetCartItems([])

  return (
    <GlobalCartContext.Provider value={{
      CartItems, AddToCart, RemoveFromCart, UpdateNote,
      GetQuantity, TotalPrice, TotalCount, ClearCart,
    }}>
      {children}
    </GlobalCartContext.Provider>
  )
}

export const UseGlobalCart = (): GlobalCartContextType => {
  const Ctx = useContext(GlobalCartContext)
  if (!Ctx) throw new Error("UseGlobalCart must be used within GlobalCartProvider")
  return Ctx
}
```

### D. Page — bọc Provider + dynamic import (không có logic)

```typescript
// src/modules/Menu/MenuPage.tsx
"use client"
import dynamic from "next/dynamic"
import { MenuProvider } from "./MenuContext"
import { Skeleton } from "@/components/ui/skeleton"

const MenuHeader   = dynamic(() => import("./components/MenuHeader"),   { loading: () => <Skeleton className="h-14 w-full" /> })
const CategoryTabs = dynamic(() => import("./components/CategoryTabs"), { loading: () => <Skeleton className="h-10 w-full" /> })
const MenuCard     = dynamic(() => import("./components/MenuCard"))
const CartFooter   = dynamic(() => import("./components/CartFooter"))

export default function MenuPage() {
  return (
    <MenuProvider>
      <div className="max-w-md mx-auto min-h-screen bg-amber-50">
        <MenuHeader />
        <CategoryTabs />
        <main className="px-4 pb-24 pt-2">
          {/* render MenuCard list từ MenuContext */}
        </main>
        <CartFooter />
      </div>
    </MenuProvider>
  )
}
```

### E. UI Component — chỉ render JSX, gọi hàm từ context

```typescript
// src/modules/Menu/components/MenuCard.tsx
"use client"
import { UseGlobalCart } from "@/context/GlobalCartContext"

interface Props { Item: MenuItem }

export default function MenuCard({ Item }: Props) {
  const { GetQuantity, AddToCart, RemoveFromCart } = UseGlobalCart()
  const Qty = GetQuantity(Item.Id)

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-3 flex gap-3 items-center mb-3
      ${!Item.Available ? "opacity-40 grayscale pointer-events-none" : ""}`}>
      <img src={`/api/image/${Item.ImageUrl}`} className="w-20 h-20 rounded-xl object-cover" alt={Item.Name} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base truncate">{Item.Name}</p>
        <p className="font-bold text-amber-600">{FormatVnd(Item.UnitPrice)}</p>
        {!Item.Available && (
          <span className="bg-red-100 text-red-600 text-xs rounded-full px-2 py-0.5 font-semibold">Hết</span>
        )}
      </div>
      {Item.Available && (
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => RemoveFromCart(Item.Id)}
            className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 font-bold text-lg">−</button>
          <span className="w-5 text-center font-bold">{Qty}</span>
          <button onClick={() => AddToCart({ MenuItemId: Item.Id, Name: Item.Name, UnitPrice: Item.Price })}
            className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-lg">+</button>
        </div>
      )}
    </div>
  )
}
```

---

## 10. Axios Client

```typescript
// src/lib/AxiosClient.ts
import axios from "axios"

export const AxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
})

AxiosClient.interceptors.response.use(
  Response => Response,
  Error => {
    const Message = Error?.response?.data?.message ?? Error?.message ?? "Có lỗi xảy ra"
    // Toast lỗi sẽ được gọi từng module Context, không gọi ở đây
    return Promise.reject({ ...Error, UserMessage: Message })
  }
)
```

---

## 11. UUID v7 — App layer (không dùng PostgreSQL extension)

Thay vì dùng `pg_uuidv7` (không có sẵn trong `postgres:16-alpine`), generate UUID v7 tại app layer:

```bash
yarn add uuidv7
```

```typescript
// src/lib/GenerateId.ts
import { uuidv7 } from "uuidv7"

export const GenerateId = (): string => uuidv7()

// Hiển thị rút gọn trên bill / UI
export const ShortId = (Id: string): string =>
  Id.replace(/-/g, "").slice(-8).toUpperCase()
// "01965f2b4c9a70008000000000000001" → "00000001"
```

Trong Prisma, không dùng `@default(dbgenerated(...))` mà truyền Id từ app:

```typescript
// Trước khi tạo Order
const NewOrder = await Prisma.order.create({
  data: {
    Id:    GenerateId(),   // UUID v7
    Items: { create: Items.map(I => ({ Id: GenerateId(), ...I })) },
    ...
  }
})
```

---

## 12. VietQR — Thanh toán qua bill nhiệt

```typescript
// src/modules/AdminOrders/AdminOrdersContext.tsx — đoạn SSE + sound
useEffect(() => {
  const Source = new EventSource("/api/orders/stream")

  Source.onmessage = (Event) => {
    const NewOrder: Order = JSON.parse(Event.data)
    SetOrders(Prev => [NewOrder, ...Prev])

    // Phát âm thanh khi có đơn mới
    const Audio = new window.Audio("/sounds/NewOrder.mp3")
    Audio.play().catch(() => {})  // ignore nếu browser block autoplay
  }

  Source.onerror = () => Source.close()
  return () => Source.close()
}, [])

// Cập nhật trạng thái hai chiều: Pending ↔ InProgress ↔ Done
const UpdateStatus = async (OrderId: string, Status: OrderStatus): Promise<void> => {
  await AxiosClient.put(`/api/orders/${OrderId}`, { Status })
  SetOrders(Prev => Prev.map(O => O.Id === OrderId ? { ...O, Status } : O))
}
```

---

```typescript
// src/lib/VietQr.ts
interface VietQrParams {
  Amount:    number
  OrderInfo: string // "Don #A1B2C3D4"
}

export const BuildVietQrUrl = ({ Amount, OrderInfo }: VietQrParams): string => {
  const BankId     = process.env.STORE_BANK_ID      // vd: "MB" | "VCB" | "TCB"
  const AccountNo  = process.env.STORE_BANK_ACCOUNT
  const AccountName = process.env.STORE_BANK_OWNER
  const Template   = "compact2"

  return `https://img.vietqr.io/image/${BankId}-${AccountNo}-${Template}.png`
    + `?amount=${Amount}`
    + `&addInfo=${encodeURIComponent(OrderInfo)}`
    + `&accountName=${encodeURIComponent(AccountName ?? "")}`
}
```

---

## 13. Máy in nhiệt — LAN (TCP Socket)

```typescript
// src/lib/Printer.ts
import { Network } from "escpos"
import * as escpos from "escpos"

const PrinterIp   = process.env.PRINTER_IP   ?? "192.168.1.100"
const PrinterPort = Number(process.env.PRINTER_PORT ?? 9100)

export const PrintOrder = async (Order: PrintOrderData): Promise<void> => {
  const Device  = new Network(PrinterIp, PrinterPort)
  const Printer = new escpos.Printer(Device)

  await new Promise<void>((Resolve, Reject) => {
    Device.open((Err: Error) => {
      if (Err) return Reject(Err)

      const ShortOrderId = ShortId(Order.Id)

      Printer
        .align("CT")
        .style("B").size(1, 1).text(process.env.NEXT_PUBLIC_STORE_NAME ?? "")
        .style("NORMAL").size(0, 0)
        .text(process.env.NEXT_PUBLIC_STORE_PHONE ?? "")
        .text(process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "")
        .drawLine()
        .align("LT")
        .text(`Don: #${ShortOrderId}`)
        .text(`Gio: ${FormatDateTime(Order.CreatedAt)}`)
        .drawLine()

      Order.Items.forEach(Item => {
        Printer.text(`${Item.Name.padEnd(20)} x${Item.Quantity}`)
        if (Item.Note) Printer.text(`  > ${Item.Note}`)
        Printer.text(`${FormatVnd(Item.UnitPrice * Item.Quantity).padStart(28)}`)
      })

      Printer
        .drawLine()
        .style("B").text(`Tong: ${FormatVnd(Order.TotalPrice).padStart(22)}`)
        .style("NORMAL")
        .drawLine()
        .align("CT")
        .text(`MB: ${process.env.STORE_BANK_ACCOUNT ?? ""}`)
        .text(process.env.STORE_BANK_OWNER ?? "")
        .text(`So tien: ${FormatVnd(Order.TotalPrice)}`)
        .text(`ND: Don ${ShortOrderId}`)
        .drawLine()
        .text("Cam on quy khach!")
        .text("Hen gap lai ban nhe :)")
        .feed(4).cut()
        .close(Resolve)
    })
  })
}

// Wrapper an toàn: lỗi in KHÔNG throw ra ngoài, chỉ log
// Đơn đã lưu DB → admin bấm in lại trên AdminOrders
export const SafePrintOrder = async (Order: PrintOrderData): Promise<void> => {
  try {
    await PrintOrder(Order)
  } catch (Err) {
    console.error(`[Printer] Lỗi in đơn #${ShortId(Order.Id)}:`, Err)
  }
}
```

```env
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

---

## 14. Auth — 1 tài khoản từ `.env`

```typescript
// src/lib/Auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(Credentials) {
        const Email    = process.env.ADMIN_EMAIL
        const Password = process.env.ADMIN_PASSWORD_HASH  // bcrypt hash

        if (
          Credentials?.email === Email &&
          await bcrypt.compare(String(Credentials?.password), Password ?? "")
        ) {
          return { id: "admin", email: Email, name: "Admin" }
        }
        return null
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
})
```

```typescript
// src/middleware.ts
export { auth as middleware } from "@/lib/Auth"

export const config = {
  matcher: ["/admin/:path*"],
}
```

```env
ADMIN_EMAIL=admin@banhmi.com
ADMIN_PASSWORD_HASH=$2b$10$...  # bcrypt hash của password
```

---

## 15. Prisma Schema (UUID v7 từ app, PascalCase)

```prisma
// prisma/schema.prisma
generator Client {
  provider = "prisma-client-js"
}

datasource Db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  BanhMi
  DoUong
}

enum OrderStatus {
  Pending
  InProgress
  Done
}

model MenuItem {
  Id          String      @id @db.Uuid
  Name        String
  Category    Category
  Price       Int
  ImageUrl    String?
  Description String?
  Available   Boolean     @default(true)
  SortOrder   Int         @default(0)
  CreatedAt   DateTime    @default(now())
  UpdatedAt   DateTime    @updatedAt
  OrderItems  OrderItem[]

  @@map("MenuItem")
}

model Order {
  Id         String      @id @db.Uuid
  Status     OrderStatus @default(Pending)
  TotalPrice Int
  CreatedAt  DateTime    @default(now())
  UpdatedAt  DateTime    @updatedAt
  Items      OrderItem[]

  @@map("Order")
}

model OrderItem {
  Id         String   @id @db.Uuid
  OrderId    String   @db.Uuid
  MenuItemId String   @db.Uuid
  Quantity   Int
  Note       String?
  UnitPrice  Int
  Order      Order    @relation(fields: [OrderId],    references: [Id])
  MenuItem   MenuItem @relation(fields: [MenuItemId], references: [Id])

  @@map("OrderItem")
}
```

> **Lưu ý:** Không có `OrderNumber autoincrement`. Order ID là UUID v7, hiển thị rút gọn 8 ký tự (`ShortId`).

---

## 15b. Seed Data (`prisma/seed.ts`)

```typescript
import { PrismaClient } from "@prisma/client"
import { uuidv7 } from "uuidv7"

const Prisma = new PrismaClient()

const MenuSeed = [
  // Bánh mì
  { Name: "Bánh mì đặc biệt",    Category: "BanhMi", Price: 35000, Description: "Thịt nguội + pate + trứng", SortOrder: 1 },
  { Name: "Bánh mì thịt nguội",  Category: "BanhMi", Price: 25000, SortOrder: 2 },
  { Name: "Bánh mì trứng",       Category: "BanhMi", Price: 22000, SortOrder: 3 },
  { Name: "Bánh mì pate",        Category: "BanhMi", Price: 20000, SortOrder: 4 },
  { Name: "Bánh mì xíu mại",     Category: "BanhMi", Price: 28000, SortOrder: 5 },
  { Name: "Bánh mì gà xé",       Category: "BanhMi", Price: 27000, SortOrder: 6 },
  { Name: "Bánh mì bì",          Category: "BanhMi", Price: 23000, SortOrder: 7 },
  { Name: "Bánh mì chả cá",      Category: "BanhMi", Price: 26000, SortOrder: 8 },
  { Name: "Bánh mì thịt nướng",  Category: "BanhMi", Price: 30000, SortOrder: 9 },
  { Name: "Bánh mì chay",        Category: "BanhMi", Price: 18000, SortOrder: 10 },
  // Đồ uống
  { Name: "Trà tắc",             Category: "DoUong", Price: 15000, SortOrder: 1 },
  { Name: "Trà đá",              Category: "DoUong", Price: 10000, SortOrder: 2 },
  { Name: "Nước suối",           Category: "DoUong", Price: 10000, SortOrder: 3 },
  { Name: "Cà phê sữa đá",       Category: "DoUong", Price: 20000, SortOrder: 4 },
  { Name: "Sinh tố bơ",          Category: "DoUong", Price: 25000, SortOrder: 5 },
]

async function Main() {
  console.log("Seeding menu...")
  for (const Item of MenuSeed) {
    await Prisma.menuItem.upsert({
      where:  { Id: uuidv7() },   // tạo mới mỗi lần seed
      create: { Id: uuidv7(), ...Item, Available: true },
      update: {},
    })
  }
  console.log(`Seeded ${MenuSeed.length} items.`)
}

Main()
  .catch(console.error)
  .finally(() => Prisma.$disconnect())
```

```json
// package.json — thêm vào
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 16. Cấu trúc thư mục đầy đủ

```
.
├── src/
│   ├── app/
│   │   ├── (Customer)/
│   │   │   ├── menu/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   └── success/[OrderId]/page.tsx
│   │   ├── (Admin)/
│   │   │   ├── layout.tsx               ← Admin layout: sidebar + topnav chung
│   │   │   └── admin/
│   │   │       ├── login/page.tsx
│   │   │       ├── menu/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── stats/page.tsx
│   │   │       └── qr/page.tsx
│   │   ├── api/
│   │   │   ├── menu/route.ts            # GET, POST
│   │   │   ├── menu/[Id]/route.ts       # PUT, DELETE
│   │   │   ├── orders/route.ts          # GET, POST (+ trigger print)
│   │   │   ├── orders/[Id]/route.ts     # PUT status
│   │   │   ├── orders/stream/route.ts   # GET SSE
│   │   │   ├── print/[Id]/route.ts      # POST in lại bill
│   │   │   └── image/[...Path]/route.ts # GET ảnh từ /uploads
│   │   ├── globals.css
│   │   └── layout.tsx                   # NunitoFont + GlobalCartProvider + Toaster
│   ├── context/
│   │   └── GlobalCartContext.tsx        # Share cart giữa mọi module
│   ├── modules/                         # Mỗi màn = 1 module độc lập
│   │   ├── Menu/
│   │   ├── Cart/
│   │   ├── Success/
│   │   ├── AdminMenu/
│   │   ├── AdminOrders/
│   │   ├── AdminStats/
│   │   ├── AdminQr/
│   │   └── AdminLogin/
│   ├── lib/
│   │   ├── AxiosClient.ts
│   │   ├── PrismaClient.ts
│   │   ├── Auth.ts
│   │   ├── Printer.ts               # ESC/POS LAN TCP
│   │   ├── VietQr.ts
│   │   ├── GenerateId.ts            # uuidv7() + ShortId()
│   │   └── FormatVnd.ts
│   ├── types/
│   │   └── Index.ts
│   └── middleware.ts                # Auth guard /admin/*
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── uploads/                         # Ảnh món — mount Docker volume
├── public/
│   └── placeholder.png
├── Dockerfile
├── docker-compose.yml
├── .gitlab-ci.yml
├── next.config.ts
├── tsconfig.json
├── .yarnrc.yml
├── package.json
└── .env
```

---

## 17. Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from "next"

const NextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.vietqr.io" },
    ],
  },
}

export default NextConfig
```

---

## 18. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 19. Yarn v3

```yaml
# .yarnrc.yml
yarnPath: .yarn/releases/yarn-3.8.0.cjs
nodeLinker: node-modules
```

```json
// package.json — scripts
{
  "scripts": {
    "Dev": "next dev",
    "Build": "next build",
    "Start": "next start",
    "Lint": "next lint",
    "TypeCheck": "tsc --noEmit",
    "DbMigrate": "prisma migrate dev",
    "DbGenerate": "prisma generate",
    "DbSeed": "prisma db seed",
    "DbStudio": "prisma studio"
  }
}
```

---

## 20. Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS Base
RUN corepack enable

# ── Dependencies ──────────────────────────────────────
FROM Base AS Deps
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install --immutable

# ── Builder ───────────────────────────────────────────
FROM Base AS Builder
WORKDIR /app
COPY --from=Deps /app/node_modules ./node_modules
COPY . .
RUN yarn DbGenerate
RUN yarn Build

# ── Runner ────────────────────────────────────────────
FROM Base AS Runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=Builder /app/public        ./public
COPY --from=Builder /app/.next/standalone  ./
COPY --from=Builder /app/.next/static ./.next/static

RUN mkdir -p uploads && chown nextjs:nodejs uploads
VOLUME ["/app/uploads"]

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

---

## 21. Docker Compose — Shared Network

```yaml
# docker-compose.yml
networks:
  BanhMiNetwork:
    driver: bridge

services:
  Db:
    image: postgres:16-alpine
    container_name: BanhMiDb
    restart: unless-stopped
    networks:
      - BanhMiNetwork
    environment:
      POSTGRES_DB: BanhMiDb
      POSTGRES_USER: BanhMiUser
      POSTGRES_PASSWORD: BanhMiSecret
    ports:
      - "5432:5432"
    volumes:
      - PostgresData:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U BanhMiUser -d BanhMiDb"]
      interval: 10s
      retries: 5

  App:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: BanhMiApp
    restart: unless-stopped
    networks:
      - BanhMiNetwork
    depends_on:
      Db:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://BanhMiUser:BanhMiSecret@Db:5432/BanhMiDb"
      NEXTAUTH_URL: "${NEXTAUTH_URL}"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
    ports:
      - "3000:3000"
    volumes:
      - UploadsData:/app/uploads

volumes:
  PostgresData:
  UploadsData:
```

**Test local:** `docker compose up Db -d` → Next.js chạy `yarn Dev`, kết nối `localhost:5432`
**Production:** `docker compose up -d` → cả App + Db chạy trong `BanhMiNetwork`

---

## 22. Environment Variables đầy đủ

```env
# .env

# Database
DATABASE_URL="postgresql://BanhMiUser:BanhMiSecret@localhost:5432/BanhMiDb"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
ADMIN_EMAIL="admin@banhmi.com"
ADMIN_PASSWORD_HASH="$2b$10$..."          # bcrypt hash

# Store info
NEXT_PUBLIC_STORE_NAME="Bánh Mì Palette"
NEXT_PUBLIC_STORE_PHONE="0926060884"
NEXT_PUBLIC_STORE_ADDRESS="Phường Tân Tạo, TPHCM"

# VietQR - thanh toán
STORE_BANK_ID="MB"
STORE_BANK_ACCOUNT="0926060884"
STORE_BANK_OWNER="BANH MI PALETTE"

# Printer (Xprinter XP-58 qua LAN)
PRINTER_IP="192.168.1.100"
PRINTER_PORT="9100"

# API base (trống = same origin)
NEXT_PUBLIC_API_URL=""
```

---

## 23. GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - build
  - deploy

variables:
  DOCKER_IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
  DOCKER_IMAGE_LATEST: "$CI_REGISTRY_IMAGE:latest"
  DOCKER_TLS_CERTDIR: ""

Validate:
  stage: validate
  image: node:20-alpine
  before_script:
    - corepack enable
    - yarn install --immutable
  script:
    - yarn TypeCheck
    - yarn Lint
  cache:
    key: "$CI_COMMIT_REF_SLUG"
    paths: [.yarn/cache, node_modules]

BuildImage:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
  script:
    - docker build -t "$DOCKER_IMAGE" -t "$DOCKER_IMAGE_LATEST" .
    - docker push "$DOCKER_IMAGE"
    - docker push "$DOCKER_IMAGE_LATEST"
  only: [main, develop]

Deploy:
  stage: deploy
  image: alpine:3.19
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$DEPLOY_SSH_KEY" | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan "$DEPLOY_HOST" >> ~/.ssh/known_hosts
  script:
    - |
      ssh "$DEPLOY_USER@$DEPLOY_HOST" "
        cd /opt/banhmi &&
        docker compose pull App &&
        docker compose up -d App &&
        docker image prune -f
      "
  environment:
    name: production
    url: "https://$DEPLOY_HOST"
  only: [main]

# GitLab CI/CD Variables cần set:
# DEPLOY_SSH_KEY, DEPLOY_HOST, DEPLOY_USER
# NEXTAUTH_SECRET, NEXTAUTH_URL
# (CI_REGISTRY_* tự động từ GitLab)
```

---

## 24. AI Dev Workflow (context7 + Claude Code Skills)

```
Trước khi code module mới:
  → Dùng context7 MCP để lấy docs Next.js 16 App Router mới nhất

Sau khi viết Context file:
  → /code-review: kiểm tra pattern Context API đúng không, logic đúng không

Sau khi implement xong 1 module:
  → /verify: test thực tế trên mobile (resize browser, golden path)

Trước khi merge MR:
  → /code-review high: full review

Trước deploy production:
  → /security-review: check auth, input validation, injection
```

---

## 25. Ước tính timeline

| Phase     | Nội dung                                                                                     | Thời gian      |
| --------- | -------------------------------------------------------------------------------------------- | -------------- |
| 0         | Init: Yarn v3, Next.js 16, Docker Compose, Prisma, shadcn, tsconfig, Dockerfile, CI template | 1 ngày         |
| 1         | GlobalCartContext + Module Menu (mobile UI đầy đủ)                                           | 2 ngày         |
| 2         | Module Cart + Success (với VietQR)                                                           | 1 ngày         |
| 3         | API routes: menu, orders, SSE stream, image serve                                            | 2 ngày         |
| 4         | Module AdminMenu (CRUD + upload ảnh + toggle)                                                | 1 ngày         |
| 5         | Module AdminOrders (real-time SSE + print tự động)                                           | 2 ngày         |
| 6         | Kết nối máy in LAN TCP (test thực tế)                                                        | 1 ngày         |
| 7         | Module AdminStats + AdminQr                                                                  | 1 ngày         |
| 8         | AdminLogin + NextAuth + middleware.ts                                                        | 1 ngày         |
| 9         | Admin layout chung (sidebar/topnav)                                                          | 0.5 ngày       |
| 10        | GitLab CI/CD hoàn chỉnh + deploy lần đầu                                                     | 1 ngày         |
| 11        | Test mobile thực tế, fix UI, fix máy in, fix VietQR                                          | 2 ngày         |
| **Total** |                                                                                              | **~15.5 ngày** |

---

## 26. Checklist trước khi bắt đầu code

- [ ] Bổ sung `STORE_BANK_ID`, `STORE_BANK_ACCOUNT`, `STORE_BANK_OWNER` vào `.env`
- [ ] Xác nhận IP máy in Xprinter trong mạng LAN quán (`PRINTER_IP`)
- [ ] Mua/cấu hình domain + SSL (HTTPS) cho public QR
- [ ] Tạo GitLab repo + cấu hình CI/CD Variables
- [ ] Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Generate `ADMIN_PASSWORD_HASH`: `node -e "const b=require('bcryptjs');console.log(b.hashSync('yourpassword',10))"`
- [ ] Cài context7 MCP vào Claude Code để đọc docs Next.js 16
