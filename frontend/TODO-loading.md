# TODO: Xử lý loading cho các tác vụ trong frontend

## Mục tiêu
Bổ sung trạng thái loading nhất quán cho toàn bộ view:
1. Loading khi tải dữ liệu ban đầu (tránh hiện "empty state" sai lệch).
2. Spinner trên các nút đang xử lý (lưu/xóa/tạo/xóa tất cả/lưu template).
3. Loading cho tác vụ phụ (in/chia sẻ hóa đơn, in hợp đồng).

## Các bước
- [x] Đọc và phân tích các view hiện có
- [x] Rooms.vue: loading bảng + spinner nút lưu/xóa
- [x] Expenses.vue: loading bảng + spinner nút lưu/xóa
- [x] Users.vue: loading bảng + spinner nút lưu/xóa
- [x] Contracts.vue: loading bảng + spinner nút + loading in hợp đồng
- [ ] MonthlyBilling.vue: loading bảng + spinner nút + loading in/chia sẻ
- [ ] Settings.vue: loading cài đặt + spinner nút lưu
- [ ] Dashboard.vue: loading tổng quan + spinner các thẻ số liệu
- [ ] Kiểm tra chạy frontend (Vite) không lỗi
