# Features

## Authentication

### Login

Admin có thể
- Login sử dụng username/password mặc định lưu trong file cấu hình

---

## Dashboard:
1. Xem bảng dánh sách hóa đơn đến hạn thanh toán,quá hạn thanh toán
2. Biểu đồ doanh thu, chi phí theo từng tháng 
3. Danh sách phòng, sắp xếp phòng trống lên đầu

## Room management:
1. Xem danh sách/Xem chi tiết/Thêm/Sửa/Xóa phòng trọ
2. Các trường: Mã phòng, Thông tin, Giá, Trạng thái(Đang ở, Trống, Bảo trì), Ghi chú

## User management:
1. Xem danh sách/Xem chi tiết/Thêm/Sửa/Xóa người thuê
2. Các trường: Tên, Điện thoại, Email, Giấy tờ, Ghi chú

## Contract management:
1. Xem danh sách/Xem chi tiết/Thêm/Sửa/Xóa hợp đồng
2. Các trường: 	Mã hợp đồng, Mã phòng, Người thuê, Người ở cùng, Tiền cọc, Ngày bắt đầu, Ngày kết thúc, Số người ở, 
				Giá phòng, Đơn giá điện (kWh), Đơn giá nước (người), Phí dịch vụ (người), Ngày bắt đầu thanh toán, Ngày kết thúc thanh toán, Trạng thái, Ghi chú
## Billing management:
1. Xem danh sách/Tạo dữ liệu theo tháng/Sửa hóa đơn
2. Các trường: Tháng, Phòng, Người thuê, Số điện cũ, Số điện mới, Số người, đơn giá điện, đơn giá nước, phí dịch vụ, Tổng số tiền, Trạng thái(Bản nháp, Chưa thu, Đã thu, Hủy), Ghi chú
Mô tả chức năng:
-> người dùng chọn tháng 
-> ấn tạo data 
-> dữ liệu tổng hợp theo tháng của từng phòng được generate dựa trên hợp đồng
-> người dùng có thể thêm tiền điện mới nếu có và lưu lại để cập nhật số tiền mới
-> với mỗi bill, người dùng có thể click in phiếu thu để tạo html phiếu thu, hoặc click chia sẻ link để copy 1ink url public

## Expense management:
1. Xem danh sách/Thêm/Sửa/Xóa chi phí
2. Các trường: Ngày, Mô tả, Số tiền, Ghi chú


