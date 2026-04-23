# 🏦 BankSave — Bank Saving System

A full-stack web application for managing bank customers, savings accounts with deposito (time deposit) types, and transactions including deposits and withdrawals with automatic interest calculation.

## 📋 Features

- **Customer Management** — Create, Read, Update, Delete customers
- **Account Management** — Create/manage accounts with deposito types
- **Deposito Type Management** — Configure deposit packages with interest rates
- **Deposit & Withdraw** — Full transaction support with interest calculation
- **Interest Calculation** — Automatic monthly interest computation on withdrawals
- **Transaction History** — Complete audit trail for all account operations
- **Dashboard** — Real-time overview with stats and recent transactions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | SQLite3 (via better-sqlite3) |
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS (dark theme) |
| **API Docs** | Swagger/OpenAPI |
| **API Testing** | Postman Collection |

## 🏗️ Architecture

Both backend and frontend follow the **MVC (Model-View-Controller)** pattern:

```
Backend MVC:
├── Models      → Database queries (SQLite)
├── Controllers → Business logic & validation
└── Routes      → API endpoints (Views)

Frontend MVC:
├── Models      → API services (HTTP calls)
├── Controllers → Custom React hooks (useCustomers, useAccounts, etc.)
└── Views       → React components (JSX pages)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Marlblue/bank-saving-system.git
cd bank-saving-system
```

### 2. Start the Backend
```bash
cd backend
npm install
cp .env.example .env   # or create .env with PORT=5000
npm start
```
The API will be available at `http://localhost:5000`
Swagger docs at `http://localhost:5000/api-docs`

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`

## 📚 API Endpoints

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get customer details |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Deposito Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deposito-types` | List all types |
| POST | `/api/deposito-types` | Create type |
| PUT | `/api/deposito-types/:id` | Update type |
| DELETE | `/api/deposito-types/:id` | Delete type |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List all accounts |
| GET | `/api/accounts/:id` | Get account details |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/:id/deposit` | Deposit money |
| POST | `/api/accounts/:id/withdraw` | Withdraw money |
| GET | `/api/accounts/:id/transactions` | Transaction history |

## 💰 Interest Calculation

When a customer withdraws money, the system calculates interest:

```
monthly_return = yearly_return / 12 / 100
interest = starting_balance × months_elapsed × monthly_return
ending_balance = starting_balance + interest
final_balance = ending_balance − withdrawal_amount
```

**Example:** Balance of Rp 1,000,000 with Deposito Gold (7% yearly), after 6 months:
- Monthly return = 7% / 12 = 0.5833%
- Interest = 1,000,000 × 6 × 0.005833 = Rp 35,000
- Ending balance = Rp 1,035,000

## 📁 Project Structure

```
bank-saving-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Data models (M)
│   ├── controllers/     # Business logic (C)
│   ├── routes/          # API routes (V)
│   ├── middleware/       # Error handling
│   ├── index.js         # Entry point
│   └── swagger.js       # API docs config
├── frontend/
│   └── src/
│       ├── services/    # API layer (Model)
│       ├── hooks/       # Custom hooks (Controller)
│       │   ├── useDashboard.js
│       │   ├── useCustomers.js
│       │   ├── useAccounts.js
│       │   ├── useAccountDetail.js
│       │   ├── useCustomerDetail.js
│       │   └── useDepositoTypes.js
│       ├── components/  # UI components (View)
│       ├── pages/       # Page views (View)
│       └── utils/       # Utilities
├── docs/                # Documentation
│   ├── SYSTEM_SPECIFICATION.md
│   ├── DATABASE_DESIGN.md
│   ├── API_DOCUMENTATION.md
│   ├── SCREEN_API_MAPPING.md
│   ├── USER_JOURNEY.md
│   ├── UML_DIAGRAMS.md
│   └── ERROR_HANDLING.md
└── postman/             # API collection
```

## 📝 Documentation

- [System Specification](docs/SYSTEM_SPECIFICATION.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Screen → API Mapping](docs/SCREEN_API_MAPPING.md)
- [User Journey & Wireframes](docs/USER_JOURNEY.md)
- [UML Diagrams](docs/UML_DIAGRAMS.md)
- [Error Handling](docs/ERROR_HANDLING.md)
- [Deployment Guide (Railway + Cloudflare)](docs/DEPLOYMENT.md)

## 🧪 Testing with Postman

1. Import `postman/Bank_Saving_System.postman_collection.json` into Postman
2. Import `postman/Bank_Saving_System.postman_environment.json` as environment
3. Select the "Bank Saving System - Local" environment
4. Run requests in order — IDs are auto-saved to environment variables

## 📄 License

MIT
