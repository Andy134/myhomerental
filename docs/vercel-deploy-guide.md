# Hướng dẫn Deploy lên Vercel (HomeRental)

> Tài liệu này hướng dẫn **từng bước** cấu hình và deploy project **HomeRental** lên [Vercel](https://vercel.com).
> Project là monorepo gồm:
> - `backend/` — Express + MongoDB (API, prefix `/api`)
> - `frontend/` — Vue 3 + Vite (SPA)
>
> Mô hình deploy: **1 Vercel Project duy nhất** (monorepo) với `vercel.json` ở root, giúp:
> - Dùng chung 1 domain cho cả frontend & backend.
> - API giữ nguyên đường dẫn tương đối `/api` (không cần đổi code frontend).
> - SPA fallback hoạt động cho trang chia sẻ `/shared-billing/:token`.

---

## Mục lục

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Bước 1 — Cấu hình Backend cho Serverless](#bước-1--cấu-hình-backend-cho-serverless)
3. [Bước 2 — Kiểm tra Build Frontend](#bước-2--kiểm-tra-build-frontend)
4. [Bước 3 — Tạo vercel.json ở Root](#bước-3--tạo-verceljson-ở-root)
5. [Bước 4 — Import & Cấu hình Project trên Vercel](#bước-4--import--cấu-hình-project-trên-vercel)
6. [Bước 5 — Thêm Environment Variables](#bước-5--thêm-environment-variables)
7. [Bước 6 — Deploy](#bước-6--deploy)
8. [Bước 7 — Kiểm tra sau khi Deploy](#bước-7--kiểm-tra-sau-khi-deploy)
9. [Xử lý sự cố thường gặp](#9-xử-lý-sự-cố-thường-gặp)

---

## 1. Chuẩn bị

Trước khi bắt đầu, cần có:

- ✅ Tài khoản **Vercel** (đăng ký tại https://vercel.com — có thể đăng nhập bằng GitHub).
- ✅ Repo GitHub đã push: `https://github.com/Andy134/myhomerental` (branch `master`).
- ✅ **MongoDB connection string** (MongoDB Atlas) — ví dụ:
  ```
  mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/home_rental
  ```
- ✅ Node.js ≥ 18 trên máy.

### 1.1 Cài Vercel CLI (tùy chọn, dùng để deploy từ terminal)

```bash
npm install -g vercel
```

Kiểm tra:

```bash
vercel --version
```

### 1.2 Đăng nhập Vercel CLI

```bash
vercel login
```

> Nếu không muốn dùng CLI, có thể bỏ qua mục này và deploy hoàn toàn qua dashboard (xem [Bước 4](#bước-4--import--cấu-hình-project-trên-vercel)).

---

## 2. Bước 1 — Cấu hình Backend cho Serverless

Trên Vercel, backend Express được chạy dưới dạng **serverless function**. Do đó cần sửa `backend/src/index.js` để:

1. **Export app** (`module.exports = app`) — Vercel dùng đối tượng này làm handler.
2. **Chỉ gọi `app.listen()` khi chạy local** (qua `npm start` / `node src/index.js`), tránh tạo listener trùng trong serverless.
3. **Kết nối MongoDB được cache** qua `global` để tái sử dụng giữa các lần invocation (tránh kết nối lại mỗi cold start).

Nội dung `backend/src/index.js` sau khi sửa:

```js
/**
 * Entry point - Home Rental Backend
 */
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const roomRoutes = require('./routes/rooms')
const userRoutes = require('./routes/users')
const contractRoutes = require('./routes/contracts')
const monthlyBillingRoutes = require('./routes/monthly_billings')
const expenseRoutes = require('./routes/expenses')
const publicRoutes = require('./routes/public')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/users', userRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/monthly-billings', monthlyBillingRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/public', publicRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Chỉ listen khi chạy trực tiếp (npm start / node src/index.js)
// Trên Vercel (serverless), export app để Vercel quản lý
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB')
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
      })
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message)
      process.exit(1)
    })
}

// Serverless: kết nối MongoDB được cache qua global để tái sử dụng
const cached = global.mongooseCache
if (!cached) {
  global.mongooseCache = mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB (serverless)'))
    .catch(err => console.error('MongoDB connection error:', err.message))
}

module.exports = app
```

### 2.1 Test lại ở local

Sau khi sửa, chạy lại backend để đảm bảo không hỏng:

```bash
cd backend
npm start
```

Mở `http://localhost:3000/api/health` → phải trả về `{"status":"ok", ...}`.

---

## 3. Bước 2 — Kiểm tra Build Frontend

Đảm bảo frontend build ra thư mục `dist` bình thường:

```bash
cd frontend
npm run build
```

Kết quả mong đợi: tạo thư mục `frontend/dist/`.

> Lưu ý: `frontend/src/services/api.js` đang dùng `baseURL: '/api'` (tương đối) → khi deploy cùng 1 Vercel project, mọi request `/api/*` sẽ được rewrite sang backend, **không cần đổi code frontend**.

---

## 4. Bước 3 — Tạo vercel.json ở Root

Tạo file `vercel.json` **tại root repo** (`e:/Workspace/HomeRental/vercel.json`) với nội dung:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

> ⚠️ **Lưu ý quan trọng:** `dest` của route SPA fallback là **`/index.html`** (KHÔNG phải `frontend/dist/index.html`). Lý do: với `@vercel/static-build`, toàn bộ thư mục output `dist` được Vercel **mount lên root của deployment** — nên `frontend/dist/index.html` khi build ra sẽ truy cập tại `/index.html`. Nếu để `dest` sai, Vercel trả về **404 NOT_FOUND** cho mọi path (kể cả `/`).

Giải thích:

| Cấu hình | Vai trò |
|---|---|
| `builds[0]` | Build frontend bằng Vite → xuất ra `frontend/dist` |
| `builds[1]` | Chạy backend Express dưới dạng serverless function từ `backend/src/index.js` |
| `routes[0]` | Mọi request `/api/*` → backend (giữ nguyên path, ví dụ `/api/health`) |
| `routes[1]` | SPA fallback: mọi path khác → `/index.html` (đảm bảo route `/shared-billing/:token` và các route Vue hoạt động) |

> ⚠️ **Quan trọng:** nhờ `routes[1]`, trang chia sẻ hóa đơn `/shared-billing/:token` sẽ hiển thị đúng (Vue Router tự xử lý client-side).

---

## 5. Bước 4 — Import & Cấu hình Project trên Vercel

### Cách A — Qua Dashboard (khuyên dùng)

1. Truy cập https://vercel.com → **Add New → Project**.
2. Chọn repo **`Andy134/myhomerental`** → **Import**.
3. Vì đã có `vercel.json` ở root, Vercel sẽ tự nhận diện cấu hình. Nếu dashboard hỏi:
   - **Framework Preset:** `Other` (cấu hình do `vercel.json` quản lý).
   - **Root Directory:** `/` (root repo).
   - Không cần set Build Command / Output Directory (đã nằm trong `vercel.json`).
4. Nhấn **Deploy**.

### Cách B — Qua CLI

```bash
# Tại root repo
vercel --prod
```

Lần đầu chạy, CLI sẽ hỏi:
- Link tới project nào? → tạo mới (hoặc chọn project có sẵn).
- Root directory? → giữ `/`.
- Build command? → giữ nguyên (dùng `vercel.json`).

---

## 6. Bước 5 — Thêm Environment Variables

Vì `.env` **không được commit** lên git (theo `backend/.gitignore`), cần khai báo `MONGODB_URI` trực tiếp trên Vercel:

### Qua Dashboard

1. Vào project **HomeRental** trên Vercel → **Settings → Environment Variables**.
2. Thêm biến:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/home_rental` |
3. Gán cho môi trường: **Production**, **Preview**, **Development** (bấm chọn cả 3).
4. **Save**.

### Qua CLI

```bash
vercel env add MONGODB_URI production
# dán connection string, nhấn Enter
```

> ⚠️ Nếu project dùng thêm các biến khác (ví dụ `JWT_SECRET`, ...) trong tương lai, cần khai báo tương tự.

---

## 7. Bước 6 — Deploy

### Lần đầu
- Deploy qua dashboard (bấm **Deploy**) hoặc CLI: `vercel --prod`.

### Các lần sau (mỗi khi push code lên GitHub)
- Nếu đã **Import** repo, Vercel **tự động deploy** khi có commit mới lên `master` (Git Integration).
- Hoặc deploy thủ công: `vercel --prod`.

---

## 8. Bước 7 — Kiểm tra sau khi Deploy

Sau khi deploy xong, mở domain của project (ví dụ `https://home-rental.vercel.app`) và kiểm tra lần lượt:

1. ✅ **API health:** `https://<domain>/api/health` → trả về `{"status":"ok", ...}`.
2. ✅ **Đăng nhập:** truy cập `https://<domain>/login` → đăng nhập bằng tài khoản admin.
3. ✅ **Dashboard:** `/dashboard` hiển thị thống kê.
4. ✅ **Quản lý:** `/rooms`, `/users`, `/contracts`, `/monthly-billing`, `/expenses` hoạt động (gọi được API).
5. ✅ **Share Billing:** ở trang Monthly Billing, bấm **Share** → copy link dạng `https://<domain>/shared-billing/<token>` → mở ở tab ẩn danh (không đăng nhập) → hiển thị chi tiết hóa đơn.

---

## 9. Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `404 Not Found` khi mở path khác ngoài `/` (hoặc cả `/`) | Thiếu SPA fallback **hoặc sai `dest`** | Kiểm tra `vercel.json` có route `"/(.*)"` → `/index.html` (không phải `frontend/dist/index.html`) |
| `/api/health` trả `404` | Route API sai | Kiểm tra route `/api/(.*)` → `backend/src/index.js` trong `vercel.json` |
| `500` + `MongoDB connection error` | Thiếu/ sai `MONGODB_URI` | Kiểm tra **Settings → Environment Variables**, bấm **Redeploy** sau khi thêm |
| API trả `CORS` lỗi | Domain thay đổi | `app.use(cors())` đang mở tất cả origin — OK; chỉ cần lưu ý nếu sau này giới hạn |
| Vercel deploy báo `Command not found: npm run build` | Root directory sai | Đảm bảo Root Directory = `/`, build do `vercel.json` điều khiển |
| Thay đổi `.env` local không ảnh hưởng deploy | Env phải khai báo trên Vercel | Luôn thêm biến trên dashboard, không phụ thuộc file `.env` local |

---

## Ghi chú liên quan

- Theo `docs/06-rules.md`: token/api_url được cấu hình **bằng tay trên Vercel** (env vars), không commit lên git.
- Nếu muốn dùng 2 Vercel project riêng (frontend/backend độc lập), cần đổi `baseURL` trong `frontend/src/services/api.js` sang `import.meta.env.VITE_API_BASE_URL || '/api'` và tạo rewrite giữa 2 domain — phức tạp hơn, không khuyến khích.

