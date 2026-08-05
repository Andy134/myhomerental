# Task: Màn hình Cài đặt - Tài khoản thanh toán

## Các bước thực hiện

- [x] 1. Tạo model `backend/src/models/setting.js` (singleton chứa payment_qr, account_number, account_name, bank_name)
- [x] 2. Tạo route `backend/src/routes/settings.js` (GET/PUT, có auth)
- [x] 3. Đăng ký route settings trong `backend/src/index.js`
- [x] 4. Thêm `GET /api/public/settings` trong `backend/src/routes/public.js`
- [x] 5. Tạo view `frontend/src/views/Settings.vue` (upload QR, form tài khoản thanh toán)
- [x] 6. Thêm route `/settings` trong `frontend/src/router/index.js`
- [x] 7. Thêm menu "Cài đặt" trong `frontend/src/components/AppLayout.vue`
- [x] 8. Hiển thị thông tin thanh toán trong `frontend/src/views/SharedBilling.vue`
