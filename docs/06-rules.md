# Git / Branch

Chỉ code trên nhánh `develop`. Không code trực tiếp trên `master`.

Chỉ push nhánh `develop` lên remote sau khi test local OK.

Chỉ merge `develop` vào `master` để deploy khi được tôi (chủ dự án) xác nhận. Không tự ý đẩy lên `master`.

# Authentication
Username/Password: get from file
tạo 1 file adm.json lưu thông tin truy cập của admin

# Datetime
format hiển thị: dd-mm-yyyy
format trong db: ddmmyyyy (giữ nguyên)
kiểu dữ liệu: string
trên UI: dùng date picker cho các trường datetime

# Tiền (giá, phí, ...)
format hiển thị: kiểu số có ngăn cách, ví dụ: 10.000.000 đ
tự động ngăn cách phần nghìn khi người dùng nhập trên UI
đơn vị mặc định: đ (việt nam đồng)

# Các Status của user, room, contract, billing, ... 
lưu chung trong 1 file status.json

# Thông tin token, api_url ...
lưu trong file .env, sau này sẽ cấu hình trên vercel bằng tay để liên kết front-end, back-end

