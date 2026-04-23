# Bank Saving System — UML Diagrams

## 1. Use Case Diagram

```mermaid
graph TB
    subgraph "Bank Saving System"
        UC1["Create Customer"]
        UC2["Edit Customer"]
        UC3["Delete Customer"]
        UC4["View Customers"]
        UC5["Create Account"]
        UC6["Edit Account"]
        UC7["Delete Account"]
        UC8["View Accounts"]
        UC9["Create Deposito Type"]
        UC10["Edit Deposito Type"]
        UC11["Delete Deposito Type"]
        UC12["Deposit Money"]
        UC13["Withdraw Money"]
        UC14["View Transaction History"]
        UC15["Calculate Interest"]
    end

    User((User / Admin))
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    UC13 -.->|"<<includes>>"| UC15
```

## 2. Class Diagram

```mermaid
classDiagram
    class Customer {
        +String id
        +String name
        +DateTime created_at
        +DateTime updated_at
        +static getAll() Customer[]
        +static getById(id) Customer
        +static create(name) Customer
        +static update(id, name) Customer
        +static delete(id) void
    }

    class DepositoType {
        +String id
        +String name
        +Number yearly_return
        +DateTime created_at
        +DateTime updated_at
        +static getAll() DepositoType[]
        +static getById(id) DepositoType
        +static create(name, yearlyReturn) DepositoType
        +static update(id, name, yearlyReturn) DepositoType
        +static delete(id) void
    }

    class Account {
        +String id
        +String customer_id
        +String deposito_type_id
        +Number balance
        +DateTime created_at
        +DateTime updated_at
        +static getAll() Account[]
        +static getById(id) Account
        +static create(customerId, depositoTypeId) Account
        +static update(id, depositoTypeId) Account
        +static delete(id) void
        +static updateBalance(id, newBalance) void
    }

    class Transaction {
        +String id
        +String account_id
        +String type
        +Number amount
        +Number balance_before
        +Number balance_after
        +Number interest_earned
        +Integer months_elapsed
        +String transaction_date
        +DateTime created_at
        +static getByAccountId(accountId) Transaction[]
        +static createDeposit(accountId, amount, date) Transaction
        +static createWithdrawal(accountId, amount, date) Object
        +static calculateInterest(balance, yearlyReturn, months) Number
    }

    class CustomerController {
        +getAll(req, res) void
        +getById(req, res) void
        +create(req, res) void
        +update(req, res) void
        +delete(req, res) void
    }

    class AccountController {
        +getAll(req, res) void
        +getById(req, res) void
        +create(req, res) void
        +update(req, res) void
        +delete(req, res) void
    }

    class DepositoTypeController {
        +getAll(req, res) void
        +getById(req, res) void
        +create(req, res) void
        +update(req, res) void
        +delete(req, res) void
    }

    class TransactionController {
        +deposit(req, res) void
        +withdraw(req, res) void
        +getHistory(req, res) void
    }

    Customer "1" --> "0..*" Account : owns
    DepositoType "1" --> "0..*" Account : classifies
    Account "1" --> "0..*" Transaction : records

    CustomerController ..> Customer : uses
    AccountController ..> Account : uses
    DepositoTypeController ..> DepositoType : uses
    TransactionController ..> Transaction : uses
    TransactionController ..> Account : uses
```

## 3. Sequence Diagram — Deposit Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (Express)
    participant DB as Database (SQLite)

    User->>FE: Navigate to Account Detail
    FE->>API: GET /api/accounts/:id
    API->>DB: SELECT account with joins
    DB-->>API: Account data
    API-->>FE: Account + transactions
    FE-->>User: Display account details

    User->>FE: Click "Deposit" button
    FE-->>User: Show deposit form (amount, date)
    User->>FE: Enter amount=1000000, date=2026-04-01
    FE->>FE: Validate inputs

    FE->>API: POST /api/accounts/:id/deposit
    API->>API: Validate amount > 0
    API->>DB: SELECT current balance
    DB-->>API: balance = 500000
    API->>DB: UPDATE balance = 1500000
    API->>DB: INSERT transaction record
    DB-->>API: Success
    API-->>FE: {transaction, new_balance: 1500000}
    FE-->>User: Show success + updated balance
```

## 4. Sequence Diagram — Withdrawal with Interest Calculation

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (Express)
    participant DB as Database (SQLite)

    User->>FE: Click "Withdraw" button
    FE-->>User: Show withdrawal form

    User->>FE: Enter amount=500000, date=2026-10-01
    FE->>API: POST /api/accounts/:id/withdraw

    API->>DB: SELECT account + deposito_type
    DB-->>API: balance=1000000, yearly_return=7%

    API->>DB: SELECT last deposit date
    DB-->>API: last_deposit=2026-04-01

    Note over API: Calculate Interest
    API->>API: months = diff(2026-04-01, 2026-10-01) = 6
    API->>API: monthly_return = 7% / 12 = 0.5833%
    API->>API: interest = 1000000 × 6 × 0.005833 = 35000
    API->>API: ending_balance = 1000000 + 35000 = 1035000
    API->>API: Verify 500000 <= 1035000 ✓

    API->>DB: UPDATE balance = 535000
    API->>DB: INSERT transaction (interest_earned=35000)
    DB-->>API: Success

    API-->>FE: Full calculation breakdown
    FE-->>User: Show interest earned + new balance
```

## 5. Activity Diagram — Withdrawal Process

```mermaid
flowchart TD
    A[Start: User requests withdrawal] --> B{Validate inputs}
    B -->|Invalid| C[Return 400 error]
    B -->|Valid| D[Fetch account data]
    D --> E{Account exists?}
    E -->|No| F[Return 404 error]
    E -->|Yes| G[Get last deposit date]
    G --> H[Calculate months elapsed]
    H --> I[Calculate monthly return]
    I --> J["Calculate interest = balance × months × monthly_return"]
    J --> K["Calculate ending balance = balance + interest"]
    K --> L{Amount <= ending balance?}
    L -->|No| M[Return 422: Insufficient balance]
    L -->|Yes| N["New balance = ending balance - amount"]
    N --> O[Update account balance]
    O --> P[Create transaction record]
    P --> Q[Return success with calculation breakdown]
    Q --> R[End]
```
