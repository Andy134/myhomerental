o# Plan: Code fix màn hình theo rule Date picker & Money auto-format

> Quy tắc coding: làm việc trên nhánh `develop`; test local OK mới push `develop`; merge `develop` vào `master` khi được chủ dự án xác nhận.

## Các bước

- [x] **Step 1**: Thêm rule Git vào `docs/06-rules.md`
- [x] **Step 2**: Bổ sung rule Datetime (date picker) & Tiền (auto-format) vào `docs/06-rules.md`
- [x] **Step 3**: Chuyển sang nhánh `develop`
- [x] **Step 4**: Tạo helper `frontend/src/services/format.js`
- [x] **Step 5**: Tạo component `MoneyInput.vue` (auto ngăn cách tiền khi nhập)
- [x] **Step 6**: Tạo component `DatePicker.vue` (chuyển đổi ddmmyyyy ↔ yyyy-mm-dd)
- [x] **Step 7**: Áp dụng vào `Expenses.vue` (date picker + money input)
- [x] **Step 8**: Áp dụng vào `Contracts.vue` (date picker + money input)
- [x] **Step 9**: Áp dụng vào `Rooms.vue` (money input)
- [x] **Step 10**: Áp dụng vào `MonthlyBilling.vue` (money input)
- [x] **Step 11**: Build frontend test local OK
- [ ] **Step 12**: Push `develop` lên remote (sau khi test OK)
- [ ] **Step 13**: Merge `develop` vào `master` (khi được xác nhận)
