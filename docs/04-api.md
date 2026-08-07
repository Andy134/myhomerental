# API Reference

> Base URL local: `http://localhost:3000`  
> Base URL production (Vercel): `https://<domain>`  
> Tất cả API có prefix `/api`. Trừ các route `public` và `auth/login`, tất cả đều yêu cầu header `Authorization: Bearer <token>`.

---

## Authentication

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Đăng nhập, trả về JWT token |

---

## Rooms

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/rooms` | ✅ | Lấy danh sách phòng |
| GET | `/api/rooms/:id` | ✅ | Xem chi tiết phòng |
| POST | `/api/rooms` | ✅ | Tạo phòng mới |
| PUT | `/api/rooms/:id` | ✅ | Cập nhật phòng |
| DELETE | `/api/rooms/:id` | ✅ | Xóa phòng |

---

## Users (Người thuê)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/users` | ✅ | Lấy danh sách người thuê |
| GET | `/api/users/:id` | ✅ | Xem chi tiết người thuê |
| POST | `/api/users` | ✅ | Tạo người thuê mới |
| PUT | `/api/users/:id` | ✅ | Cập nhật người thuê |
| DELETE | `/api/users/:id` | ✅ | Xóa người thuê |

---

## Contracts (Hợp đồng)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/contracts` | ✅ | Lấy danh sách hợp đồng |
| GET | `/api/contracts/:id` | ✅ | Xem chi tiết hợp đồng |
| POST | `/api/contracts` | ✅ | Tạo hợp đồng mới |
| PUT | `/api/contracts/:id` | ✅ | Cập nhật hợp đồng |
| DELETE | `/api/contracts/:id` | ✅ | Xóa hợp đồng |

---

## Monthly Billings (Hóa đơn tháng)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/monthly-billings` | ✅ | Lấy danh sách hóa đơn (filter by month) |
| GET | `/api/monthly-billings/:id` | ✅ | Xem chi tiết hóa đơn |
| POST | `/api/monthly-billings/generate` | ✅ | Generate hóa đơn tháng từ hợp đồng |
| PUT | `/api/monthly-billings/:id` | ✅ | Cập nhật hóa đơn (số điện, trạng thái, ...) |
| DELETE | `/api/monthly-billings/:id` | ✅ | Xóa hóa đơn |
| POST | `/api/monthly-billings/:id/share` | ✅ | Tạo share token cho hóa đơn |

---

## Expenses (Chi phí)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/expenses` | ✅ | Lấy danh sách chi phí |
| POST | `/api/expenses` | ✅ | Tạo chi phí mới |
| PUT | `/api/expenses/:id` | ✅ | Cập nhật chi phí |
| DELETE | `/api/expenses/:id` | ✅ | Xóa chi phí |

---

## Settings (Cài đặt)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/settings` | ✅ | Lấy cấu hình hệ thống |
| PUT | `/api/settings` | ✅ | Cập nhật cấu hình (payment QR, tài khoản, mẫu HĐ) |

---

## Public (Không cần auth)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/public/billing/:token` | ❌ | Xem hóa đơn qua share token |
| GET | `/api/public/settings` | ❌ | Lấy thông tin thanh toán public (QR, tài khoản) |

---

## Health Check

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/health` | ❌ | Kiểm tra server còn sống |