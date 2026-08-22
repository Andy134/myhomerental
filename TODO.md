# TODO - Lấy số điện cũ từ tháng trước khi tạo hóa đơn

## Nhiệm vụ
Khi tạo dữ liệu hóa đơn tháng mới, hệ thống cần lấy `new_electric` của hóa đơn tháng trước
(cùng phòng) để fill vào trường `old_electric` của tháng hiện tại.

## Các bước
- [ ] 1. Sửa route `generate` trong `backend/src/routes/monthly_billings.js`:
  - Thêm hàm helper `getPrevMonth(month)` tính tháng trước từ chuỗi `yyyymm`.
  - Khi tạo hóa đơn cho mỗi hợp đồng, tìm hóa đơn tháng trước của cùng `room_id`,
    lấy `new_electric` làm `old_electric`. Nếu không có (tháng đầu), giữ `old_electric = 0`.
  - `new_electric` vẫn để 0 để người dùng nhập sau khi đọc đồng hồ.

## Kiểm tra sau khi sửa
- [ ] Test luồng generate trên backend (cần server chạy Mongo).
