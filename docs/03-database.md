# User (người thuê)

| Field | Type | Mô tả |
|---|---|---|
| _id | ObjectId | Auto |
| name | String | Tên người thuê |
| phone | String | Điện thoại |
| email | String | Email |
| document | String | Giấy tờ tùy thân |
| personal_number | String | Số CCCD |
| date_of_birth | String (ddmmyyyy) | Ngày tháng năm sinh |
| permanent_address | String | Địa chỉ thường trú |
| note | String | Ghi chú |
| createdAt | Date | Auto (timestamps) |
| updatedAt | Date | Auto (timestamps) |

---

# Room (phòng trọ)

| Field | Type | Mô tả |
|---|---|---|
| _id | ObjectId | Auto |
| room_no | String | Mã phòng |
| info | String | Thông tin phòng |
| price | Number | Giá thuê |
| status | String | Trạng thái (từ status.json) |
| note | String | Ghi chú |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

---

# Contract (hợp đồng)

| Field | Type | Mô tả |
|---|---|---|
| _id | ObjectId | Auto |
| code | String | Mã hợp đồng |
| room_id | ObjectId → Room | Phòng |
| room_no | String | Số phòng (lưu nhanh) |
| user_id | ObjectId → User | Người thuê chính |
| predict_price | Number | Tiền cọc |
| start_date | String (ddmmyyyy) | Ngày bắt đầu |
| end_date | String (ddmmyyyy) | Ngày kết thúc |
| number_of_members | Number | Số người ở |
| price | Number | Giá phòng |
| electric_price | Number | Đơn giá điện (kWh) |
| water_price | Number | Đơn giá nước (người) |
| service_fee | Number | Phí dịch vụ (người) |
| status | String | Trạng thái (từ status.json) |
| share_token | String | Token chia sẻ link ký hợp đồng public |
| tenant_signature | String | Chữ ký điện tử người thuê (base64 data URL) |
| tenant_signed_at | Date | Thời điểm người thuê ký hợp đồng |
| note | String | Ghi chú |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

---

# MonthlyBilling (hóa đơn tháng)

| Field | Type | Mô tả |
|---|---|---|
| _id | ObjectId | Auto |
| month | String (yyyymm) | Tháng hóa đơn |
| room_id | ObjectId → Room | Phòng |
| user_id | ObjectId → User | Người thuê |
| old_electric | Number | Số điện cũ |
| new_electric | Number | Số điện mới |
| num_members | Number | Số người ở |
| electric_price | Number | Đơn giá điện |
| water_price | Number | Đơn giá nước |
| service_fee | Number | Phí dịch vụ |
| total | Number | Tổng tiền |
| status | String | Trạng thái (từ status.json) |
| share_token | String | Token chia sẻ link public |
| note | String | Ghi chú |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

---

# Expense (chi phí)

| Field | Type | Mô tả |
|---|---|---|
| _id | ObjectId | Auto |
| date | String (ddmmyyyy) | Ngày phát sinh |
| description | String | Mô tả |
| amount | Number | Số tiền |
| note | String | Ghi chú |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

---

# Setting (cài đặt hệ thống)

> Singleton — chỉ có 1 document với `key = 'app'`

| Field | Type | Mô tả |
|---|---|---|
| key | String | Luôn = 'app' |
| payment_qr | String | Base64 data URL của mã QR thanh toán |
| payment_account_number | String | Số tài khoản ngân hàng |
| payment_account_name | String | Tên chủ tài khoản |
| payment_bank_name | String | Tên ngân hàng |
| contract_template | String | HTML mẫu hợp đồng (WYSIWYG) |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |
