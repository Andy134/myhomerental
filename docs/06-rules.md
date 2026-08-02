# Git / Branch

Làm việc trên nhánh `develop`.

Chỉ push nhánh `develop` lên remote sau khi test local OK.

Merge `develop` vào `master` để deploy.

# Authentication
Username/Password: get from file
tạo 1 file adm.json lưu thông tin truy cập của admin

# Datetime
format hiển thị: dd-mm-yyyy
format trong db: ddmmyyyy
kiểu dữ liệu: string

# Tiền (giá, phí, ...)
format hiển thị: kiểu số có ngăn cách, ví dụ: 10.000.000 đ
đơn vị mặc định: đ (việt nam đồng)

# Các Status của user, room, contract, billing, ... 
lưu chung trong 1 file status.json

# Thông tin token, api_url ...
lưu trong file .env, sau này sẽ cấu hình trên vercel bằng tay để liên kết front-end, back-end

