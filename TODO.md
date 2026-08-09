# Task: Thêm trường personal_number (CCCD) và hiển thị trong hợp đồng

## Steps
- [x] 1. Thêm field `personal_number` vào User model (`backend/src/models/user.js`)
- [x] 2. Thêm input "Số CCCD" vào giao diện quản lý user (`frontend/src/views/Users.vue`)
- [x] 3. Cập nhật populate user trong `backend/src/routes/public.js` để trả về `personal_number`
- [x] 4. Cập nhật populate user trong `backend/src/routes/contracts.js` để trả về `personal_number`
- [x] 5. Sửa `SignContract.vue` dùng `personal_number` thay cho `id_number`
- [x] 6. Sửa `Contracts.vue` dùng `personal_number` thay cho `id_number`
