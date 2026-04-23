# Bank Saving System — API Calls Per Screen

This document maps every frontend screen to the API endpoints it calls.

---

## 1. Dashboard (`/`)

| Action               | Method | Endpoint           | Trigger        |
|----------------------|--------|-------------------|----------------|
| Load dashboard stats | GET    | `/api/dashboard`  | On page load   |

---

## 2. Customers List (`/customers`)

| Action              | Method | Endpoint              | Trigger               |
|---------------------|--------|-----------------------|-----------------------|
| Load all customers  | GET    | `/api/customers`      | On page load          |
| Create customer     | POST   | `/api/customers`      | Submit create form    |
| Update customer     | PUT    | `/api/customers/:id`  | Submit edit form      |
| Delete customer     | DELETE | `/api/customers/:id`  | Confirm delete dialog |

---

## 3. Customer Detail (`/customers/:id`)

| Action              | Method | Endpoint              | Trigger      |
|---------------------|--------|-----------------------|--------------|
| Load customer data  | GET    | `/api/customers/:id`  | On page load |

> This endpoint returns the customer with all their accounts in a single call.

---

## 4. Accounts List (`/accounts`)

| Action                | Method | Endpoint                 | Trigger               |
|-----------------------|--------|--------------------------|-----------------------|
| Load all accounts     | GET    | `/api/accounts`          | On page load          |
| Load all customers    | GET    | `/api/customers`         | On page load (for dropdown) |
| Load all deposito types | GET  | `/api/deposito-types`    | On page load (for dropdown) |
| Create account        | POST   | `/api/accounts`          | Submit create form    |
| Update account        | PUT    | `/api/accounts/:id`      | Submit edit form      |
| Delete account        | DELETE | `/api/accounts/:id`      | Confirm delete dialog |

---

## 5. Account Detail (`/accounts/:id`)

| Action              | Method | Endpoint                           | Trigger             |
|---------------------|--------|------------------------------------|---------------------|
| Load account data   | GET    | `/api/accounts/:id`                | On page load        |
| Load transactions   | GET    | `/api/accounts/:id/transactions`   | On page load        |
| Deposit money       | POST   | `/api/accounts/:id/deposit`        | Submit deposit form |
| Withdraw money      | POST   | `/api/accounts/:id/withdraw`       | Submit withdraw form|

> After deposit/withdraw, both account data and transaction history are reloaded.

---

## 6. Deposito Types (`/deposito-types`)

| Action                | Method | Endpoint                  | Trigger               |
|-----------------------|--------|---------------------------|-----------------------|
| Load all deposito types | GET  | `/api/deposito-types`     | On page load          |
| Create deposito type  | POST   | `/api/deposito-types`     | Submit create form    |
| Update deposito type  | PUT    | `/api/deposito-types/:id` | Submit edit form      |
| Delete deposito type  | DELETE | `/api/deposito-types/:id` | Confirm delete dialog |

---

## API Call Flow Diagram

```mermaid
flowchart LR
    subgraph Frontend Screens
        D[Dashboard]
        CL[Customers List]
        CD[Customer Detail]
        AL[Accounts List]
        AD[Account Detail]
        DT[Deposito Types]
    end

    subgraph Backend API
        API_DASH[GET /api/dashboard]
        API_CUST[/api/customers]
        API_CUST_ID[/api/customers/:id]
        API_ACC[/api/accounts]
        API_ACC_ID[/api/accounts/:id]
        API_TXN_D[POST .../deposit]
        API_TXN_W[POST .../withdraw]
        API_TXN_H[GET .../transactions]
        API_DT[/api/deposito-types]
        API_DT_ID[/api/deposito-types/:id]
    end

    D --> API_DASH
    CL --> API_CUST
    CD --> API_CUST_ID
    AL --> API_ACC
    AL --> API_CUST
    AL --> API_DT
    AD --> API_ACC_ID
    AD --> API_TXN_H
    AD --> API_TXN_D
    AD --> API_TXN_W
    DT --> API_DT
    DT --> API_DT_ID
```
