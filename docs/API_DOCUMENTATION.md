# Bank Saving System — API Documentation

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`  
**Swagger UI:** `http://localhost:5000/api-docs`

---

## 1. Customer APIs

### GET /api/customers
List all customers.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "John Doe",
      "created_at": "2026-04-23T10:00:00.000Z",
      "updated_at": "2026-04-23T10:00:00.000Z"
    }
  ]
}
```

### GET /api/customers/:id
Get a single customer with their accounts.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "name": "John Doe",
    "created_at": "2026-04-23T10:00:00.000Z",
    "accounts": [
      {
        "id": "acc-uuid-1",
        "deposito_type_name": "Deposito Gold",
        "balance": 1000000
      }
    ]
  }
}
```

**Response 404:**
```json
{ "success": false, "error": "Customer not found" }
```

### POST /api/customers
Create a new customer.

**Request Body:**
```json
{ "name": "John Doe" }
```

**Response 201:**
```json
{
  "success": true,
  "data": { "id": "uuid-new", "name": "John Doe" }
}
```

**Response 400:**
```json
{ "success": false, "error": "Name is required" }
```

### PUT /api/customers/:id
Update a customer.

**Request Body:**
```json
{ "name": "Jane Doe" }
```

**Response 200:**
```json
{
  "success": true,
  "data": { "id": "uuid-1", "name": "Jane Doe" }
}
```

### DELETE /api/customers/:id
Delete a customer.

**Response 200:**
```json
{ "success": true, "message": "Customer deleted successfully" }
```

**Response 409:**
```json
{ "success": false, "error": "Cannot delete customer with active accounts" }
```

---

## 2. Deposito Type APIs

### GET /api/deposito-types
List all deposito types.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "dt-1", "name": "Deposito Bronze", "yearly_return": 3.0 },
    { "id": "dt-2", "name": "Deposito Silver", "yearly_return": 5.0 },
    { "id": "dt-3", "name": "Deposito Gold", "yearly_return": 7.0 }
  ]
}
```

### GET /api/deposito-types/:id
Get a single deposito type.

### POST /api/deposito-types
Create a new deposito type.

**Request Body:**
```json
{ "name": "Deposito Platinum", "yearly_return": 10.0 }
```

### PUT /api/deposito-types/:id
Update a deposito type.

**Request Body:**
```json
{ "name": "Deposito Platinum Plus", "yearly_return": 12.0 }
```

### DELETE /api/deposito-types/:id
Delete a deposito type.

**Response 409:**
```json
{ "success": false, "error": "Cannot delete deposito type with active accounts" }
```

---

## 3. Account APIs

### GET /api/accounts
List all accounts with customer and deposito type info.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "acc-1",
      "customer_id": "cust-1",
      "customer_name": "John Doe",
      "deposito_type_id": "dt-3",
      "deposito_type_name": "Deposito Gold",
      "yearly_return": 7.0,
      "balance": 1000000,
      "created_at": "2026-04-23T10:00:00.000Z"
    }
  ]
}
```

### GET /api/accounts/:id
Get a single account with transaction history.

### POST /api/accounts
Create a new account.

**Request Body:**
```json
{ "customer_id": "cust-1", "deposito_type_id": "dt-3" }
```

### PUT /api/accounts/:id
Update an account's deposito type.

**Request Body:**
```json
{ "deposito_type_id": "dt-2" }
```

### DELETE /api/accounts/:id
Delete an account.

---

## 4. Transaction APIs

### POST /api/accounts/:id/deposit
Deposit money into an account.

**Request Body:**
```json
{ "amount": 1000000, "transaction_date": "2026-04-01" }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn-1",
      "type": "deposit",
      "amount": 1000000,
      "balance_before": 0,
      "balance_after": 1000000,
      "transaction_date": "2026-04-01"
    },
    "new_balance": 1000000
  }
}
```

### POST /api/accounts/:id/withdraw
Withdraw money from an account. System calculates interest first.

**Request Body:**
```json
{ "amount": 500000, "transaction_date": "2026-10-01" }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn-2",
      "type": "withdraw",
      "amount": 500000,
      "balance_before": 1000000,
      "balance_after": 535000,
      "interest_earned": 35000,
      "months_elapsed": 6,
      "transaction_date": "2026-10-01"
    },
    "calculation": {
      "starting_balance": 1000000,
      "yearly_return": 7.0,
      "monthly_return": 0.5833,
      "months_elapsed": 6,
      "interest_earned": 35000,
      "ending_balance_with_interest": 1035000,
      "withdrawal_amount": 500000,
      "final_balance": 535000
    }
  }
}
```

**Response 422:**
```json
{
  "success": false,
  "error": "Insufficient balance. Maximum withdrawable amount is 1035000.00"
}
```

### GET /api/accounts/:id/transactions
Get transaction history for an account.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn-1",
      "type": "deposit",
      "amount": 1000000,
      "balance_before": 0,
      "balance_after": 1000000,
      "transaction_date": "2026-04-01",
      "created_at": "2026-04-23T10:00:00.000Z"
    }
  ]
}
```

---

## 5. Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — Missing/invalid fields |
| 404 | Not Found — Resource doesn't exist |
| 409 | Conflict — Cannot delete resource with dependencies |
| 422 | Unprocessable — Business logic error (insufficient balance) |
| 500 | Server Error — Unexpected internal error |
