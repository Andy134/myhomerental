# Folder Structure

HomeRental/
├── backend/
│   ├── package.json
│   ├── README.md
│   ├── src/
│   │   ├── index.js                    # Entry point
│   │   ├── middleware/
│   │   │   └── auth.js                # Authentication middleware
│   │   ├── models/
│   │   │   ├── contract.js            # Contract model
│   │   │   ├── expense.js             # Expense model
│   │   │   ├── monthlyBilling.js      # Monthly billing model   │   │
│   │   │   ├── room.js                # Room model
│   │   │   └── user.js                # User model
│   │   └── routes/
│   │       ├── auth.js                # Auth routes
│   │       ├── contracts.js           # Contract routes
│   │       ├── expenses.js            # Expense routes
│   │       ├── monthlyBillings.js     # Monthly billing routes
│   │       ├── rooms.js               # Room routes
│   │       └── users.js               # User routes
│   └── test/
│
└── frontend/
    ├── index.html                     # Main HTML file
    ├── package.json
    ├── README.md
    ├── vite.config.js                 # Vite configuration
    ├── src/
    │   ├── App.vue                    # Root component
    │   ├── main.js                    # Entry point
    │   ├── components/
    │   │   ├── NavBar.vue             # Navigation bar
    │   │   └── Sidebar.vue            # Sidebar
    │   ├── router/
    │   │   └── index.js               # Vue Router configuration
    │   ├── services/
    │   │   ├── api.js                 # API service
    │   │   └── auth.js                # Auth service
    │   ├── utils/
    │   │   └── receiptShare.mjs       # Receipt sharing utility
    │   └── views/
	│       ├── Login.vue              # Login page
    │       ├── Dashboard.vue          # Dashboard page	
    │       ├── Contracts.vue          # Contracts page
    │       ├── Expenses.vue           # Expenses page
    │       ├── MonthlyBilling.vue     # Monthly billing page
    │       ├── Rooms.vue              # Rooms page
    │       └── Users.vue              # Users page
    └── test/