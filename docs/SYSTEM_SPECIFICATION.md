# Bank Saving System — System Specification

## 1. Overview

The Bank Saving System is a web-based application for managing bank customers, their savings accounts with various deposito (time deposit) types, and transactions including deposits and withdrawals with automatic interest calculation.

## 2. Functional Requirements

### 2.1 Customer Management
- Create, Read, Update, and Delete (CRUD) customers
- Each customer has a unique ID and name
- A customer can open more than one account
- Cannot delete a customer who has active accounts

### 2.2 Account Management
- Create, Read, Update, and Delete (CRUD) accounts
- Each account is linked to exactly one customer and one deposito type
- Account holds the customer's balance (saldo)
- Balance starts at 0 upon creation

### 2.3 Deposito Type Management
- Create, Read, Update, and Delete (CRUD) deposito types
- Each deposito type has a unique name and yearly return (bunga)
- Predefined types: Bronze (3%), Silver (5%), Gold (7%)
- Cannot delete a deposito type that is assigned to active accounts

### 2.4 Transactions
- **Deposit**: Add balance to an account with a user-specified date
- **Withdraw**: Reduce balance from an account with a user-specified date
  - System calculates ending balance before withdrawal:
    - `ending_balance = starting_balance + (starting_balance × #months × monthly_return)`
    - `monthly_return = yearly_return / 12`
  - Shows the calculated ending balance (with interest) to the customer
  - `#months` = number of months between the last deposit and the withdrawal date

## 3. Non-Functional Requirements

- **Performance**: Response time < 500ms for all API calls
- **Data Integrity**: All transactions are atomic (all-or-nothing)
- **Portability**: SQLite database, no external DB server required
- **Scalability**: Clean MVC architecture allows easy migration to PostgreSQL/MySQL

## 4. Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend Runtime | Node.js 18+ |
| Backend Framework | Express.js 4.x |
| Database | SQLite3 (via better-sqlite3) |
| Frontend Framework | React 18 (Vite) |
| Styling | Vanilla CSS |
| API Documentation | Swagger/OpenAPI 3.0 |
| API Testing | Postman |
| Version Control | Git (GitLab) |

## 5. System Architecture

The system follows the **MVC (Model-View-Controller)** pattern on both backend and frontend:

### Backend MVC
- **Model**: Database access layer (SQLite queries)
- **View**: JSON API responses (RESTful endpoints)
- **Controller**: Business logic, validation, error handling

### Frontend MVC
- **Model**: API service layer (HTTP calls to backend)
- **View**: React components (JSX pages)
- **Controller**: Custom React hooks (state + logic)

## 6. Security Considerations

- Input validation on both frontend and backend
- SQL injection prevention via parameterized queries
- CORS configuration for frontend-backend communication
- Error messages do not expose internal system details
