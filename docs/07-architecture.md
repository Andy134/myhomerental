# Folder Structure

HomeRental/
├── vercel.json                        # Vercel deploy config (monorepo: frontend + backend)
├── start.bat                          # Script khởi động local (backend + frontend)
├── TODO.md                            # Task tracking (theo dõi tiến độ bug/feature)
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js                   # Entry point (local + Vercel serverless handler)
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── contract.js           # Contract model
│   │   │   ├── expense.js            # Expense model
│   │   │   ├── monthly_billing.js    # Monthly billing model
│   │   │   ├── room.js               # Room model
│   │   │   ├── setting.js            # Setting model (singleton, key='app')
│   │   │   └── user.js               # User model (người thuê)
│   │   └── routes/
│   │       ├── auth.js               # POST /api/auth/login
│   │       ├── contracts.js          # CRUD /api/contracts + share-token (link ký hợp đồng)
│   │       ├── expenses.js           # CRUD /api/expenses
│   │       ├── monthly_billings.js   # CRUD + generate /api/monthly-billings
│   │       ├── public.js             # Public (no-auth): /api/public/billing/:token, /api/public/settings, /api/public/contract/:token (+ sign)
│   │       ├── rooms.js              # CRUD /api/rooms
│   │       ├── settings.js           # GET+PUT /api/settings (yêu cầu auth)
│   │       └── users.js              # CRUD /api/users
│   └── test/
│
└── frontend/
    ├── index.html                     # Main HTML file
    ├── package.json
    ├── vite.config.js                 # Vite configuration
    └── src/
        ├── App.vue                    # Root component
        ├── main.js                    # Entry point (Vue + Router + Bootstrap)
        ├── global.css                 # Global styles
        ├── components/
        │   ├── AppLayout.vue          # Layout chung (sidebar + content)
        │   ├── DatePicker.vue         # Reusable date picker (format dd-mm-yyyy)
        │   ├── MoneyInput.vue         # Reusable money input (tự format phần nghìn)
        │   └── RichTextEditor.vue     # WYSIWYG editor (mẫu hợp đồng)
        ├── router/
        │   └── index.js              # Vue Router + navigation guard (requiresAuth)
        ├── services/
        │   ├── api.js                # Axios instance (baseURL: '/api')
        │   ├── auth.js               # Auth helpers (login, logout, getToken)
        │   └── format.js             # Helpers: formatCurrency, formatDate, formatMonth, parseMoney...
        └── views/
            ├── Login.vue             # Trang đăng nhập
            ├── Dashboard.vue         # Dashboard (thống kê hóa đơn, doanh thu, phòng)
            ├── Rooms.vue             # Quản lý phòng trọ
            ├── Users.vue             # Quản lý người thuê
            ├── Contracts.vue         # Quản lý hợp đồng + in/xem mẫu hợp đồng
            ├── MonthlyBilling.vue    # Quản lý hóa đơn tháng + chia sẻ link
            ├── Expenses.vue          # Quản lý chi phí
            ├── Settings.vue          # Cài đặt hệ thống (tài khoản thanh toán, mẫu hợp đồng)
            ├── SharedBilling.vue     # Trang public xem hóa đơn qua share token
            └── SignContract.vue      # Trang public ký hợp đồng điện tử (xem HĐ + vẽ/tải chữ ký)
