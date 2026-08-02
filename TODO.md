# Kế hoạch triển khai In & Share Billing

## Backend

- [x] **Step 1**: Model - Thêm field `share_token` vào MonthlyBilling schema
- [x] **Step 2**: Tạo file `routes/public.js` - Route public lấy thông tin billing theo token
- [x] **Step 3**: `index.js` - Đăng ký route public
- [x] **Step 4**: `routes/monthly_billings.js` - Thêm API `POST /:id/share` để tạo/token & trả về URL

## Frontend

- [x] **Step 5**: `router/index.js` - Thêm route `/shared-billing/:token` (public)
- [x] **Step 6**: Tạo `views/SharedBilling.vue` - Trang public xem chi tiết hóa đơn
- [x] **Step 7**: `views/MonthlyBilling.vue`:
  - Gắn `@click` cho nút In → Modal xem trước phiếu thu + textbox URL + nút In
  - Gắn `@click` cho nút Share → Modal chia sẻ với URL + nút Copy

---

# Deploy lên Vercel

> Hướng dẫn chi tiết: `docs/vercel-deploy-guide.md`

## Chuẩn bị

- [ ] Cài Vercel CLI (`npm i -g vercel`) & đăng nhập (`vercel login`)
- [ ] Chuẩn bị `MONGODB_URI` (MongoDB Atlas)

## Bước 1 - Cấu hình Backend cho Serverless

- [x] Sửa `backend/src/index.js` — export `app`, chỉ `listen` khi chạy local, cache mongoose qua `global`
- [x] Test local: `node --check` + `require('./src/index.js')` → export `app` OK

## Bước 2 - Kiểm tra Build Frontend

- [x] `cd frontend && npm run build` → build thành công ra `frontend/dist/`

## Bước 3 - Tạo vercel.json ở Root

- [x] Tạo `vercel.json` — build frontend (`@vercel/static-build`) + serverless backend (`@vercel/node`)
- [x] Cấu hình rewrite `/api/*` → backend + SPA fallback cho `/shared-billing/:token`
- [x] **Fix 404 NOT_FOUND**: sửa SPA fallback `dest` từ `frontend/dist/index.html` → `/index.html` (thư mục `dist` được mount lên root deployment)
- [x] **Dọn root**: xóa `package.json`/`package-lock.json` ở root (deps `chart.js`/`vue-chartjs` đã chuyển sang `frontend/package.json`) — tránh Vercel nhận diện sai & install/build ở root

## Bước 4 - Import & Cấu hình Project trên Vercel

- [ ] Import repo `Andy134/myhomerental` trên vercel.com (Framework Preset: `Other`, Root: `/`)
- [ ] (Hoặc) deploy bằng CLI: `vercel --prod`

## Bước 5 - Thêm Environment Variables

- [ ] Thêm `MONGODB_URI` trên Vercel dashboard (Production/Preview/Development)

## Bước 6 - Kiểm tra sau Deploy

- [ ] `/api/health` trả `{"status":"ok"}`
- [ ] Đăng nhập `/login` hoạt động
- [ ] Các trang `/dashboard`, `/rooms`, `/users`, `/contracts`, `/monthly-billing`, `/expenses` gọi API OK
- [ ] Share Billing: mở `/shared-billing/<token>` ở tab ẩn danh hiển thị đúng hóa đơn

