# Sprint 1 - Authentication ✅

- [x] Backend setup (Express, JWT, middleware)
- [x] Frontend setup (Vue 3, Vite, Router, Axios)
- [x] Login UI (Login.vue)
- [x] Validation (form validation + error handling)
- [x] JWT authentication flow
- [x] Test login API - ✅ Thành công

---

# Sprint 2 - Backend API ✅

- [x] Dashboard API
- [x] Room management API
- [x] User management API
- [x] Billing management API
- [x] Expense management API

---

# Sprint 3 - Frontend (Layout + Call API) ✅

- [x] Dashboard page (/dashboard)
- [x] Room management page
- [x] User management page
- [x] Billing management page
- [x] Expense management page

---

# Sprint 4 - Tính năng bổ sung ✅

- [x] Trang Settings (/settings): cài đặt tài khoản thanh toán (QR, số tài khoản, ngân hàng)
- [x] Chia sẻ link hóa đơn: share_token + trang public /shared-billing/:token (SharedBilling.vue)
- [x] WYSIWYG mẫu hợp đồng: RichTextEditor.vue + lưu contract_template vào Settings
- [x] In/xem mẫu hợp đồng trong Contracts.vue
- [x] Collapse/expand card cài đặt trong Settings.vue
- [x] Reusable components: AppLayout, DatePicker, MoneyInput, RichTextEditor
- [x] Format utilities: format.js (formatCurrency, formatDate, formatMonth, parseMoney, ...)
- [x] Deploy Vercel (monorepo): vercel.json + serverless handler (xem vercel-deploy-guide.md)
- [x] Ký hợp đồng điện tử: share_token + link ký hợp đồng, trang public /sign-contract/:token (SignContract.vue), vẽ/tải chữ ký, lưu tenant_signature + tenant_signed_at vào Contract
- [x] Backend public contract API: GET /api/public/contract/:token, POST /api/public/contract/:token/sign
- [x] Backend contract API: POST /api/contracts/:id/share-token (tạo link ký hợp đồng)

---

# Sprint 5 - Testing & Report

- [ ] Login UI testing
- [ ] Dashboard testing
- [ ] Room management testing
- [ ] User management testing
- [ ] Billing management testing
- [ ] Expense management testing
- [ ] Settings testing
- [ ] Share billing link testing
