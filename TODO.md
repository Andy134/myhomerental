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

