# Bank Saving System — Error Handling & Edge Cases

## 1. Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

## 2. HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Missing/invalid input fields |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Referential integrity violation |
| `422` | Unprocessable Entity | Business logic failure |
| `500` | Internal Server Error | Unexpected server error |

## 3. Validation Rules

### Customer
| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required, non-empty string | "Name is required" |
| `name` | Max 100 characters | "Name must be less than 100 characters" |

### Deposito Type
| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required, non-empty, unique | "Name is required" / "Deposito type name already exists" |
| `yearly_return` | Required, number > 0 | "Yearly return must be a positive number" |

### Account
| Field | Rule | Error Message |
|-------|------|---------------|
| `customer_id` | Required, must reference existing customer | "Customer not found" |
| `deposito_type_id` | Required, must reference existing deposito type | "Deposito type not found" |

### Transactions
| Field | Rule | Error Message |
|-------|------|---------------|
| `amount` | Required, number > 0 | "Amount must be a positive number" |
| `transaction_date` | Required, valid date format (YYYY-MM-DD) | "Valid transaction date is required" |

## 4. Edge Cases

### 4.1 Deletion Constraints

| Scenario | Handling |
|----------|----------|
| Delete customer with active accounts | **409**: "Cannot delete customer with active accounts. Please delete their accounts first." |
| Delete deposito type used by accounts | **409**: "Cannot delete deposito type that is assigned to active accounts." |
| Delete account with balance > 0 | **Allowed** with confirmation (balance is forfeited) |

### 4.2 Withdrawal Edge Cases

| Scenario | Handling |
|----------|----------|
| Withdraw more than ending balance | **422**: "Insufficient balance. Maximum withdrawable amount (including interest) is {amount}" |
| No prior deposit (balance = 0) | **422**: "Account has no balance to withdraw" |
| Withdrawal date before last deposit | Allowed — months_elapsed = 0, no interest earned |
| Same-day withdrawal (0 months) | Interest = 0, only starting balance available |
| Withdraw exact ending balance | Allowed, balance becomes 0 |

### 4.3 Transaction Date Logic

| Scenario | Handling |
|----------|----------|
| Future transaction date | Allowed (system doesn't enforce date constraints) |
| Past transaction date | Allowed (backdating for corrections) |
| Invalid date format | **400**: "Valid transaction date is required (YYYY-MM-DD)" |

### 4.4 Numeric Precision

| Rule | Implementation |
|------|---------------|
| All monetary values | Rounded to 2 decimal places |
| Interest calculation | Computed with full precision, rounded at final step |
| Display format | Formatted as currency (e.g., Rp 1,000,000.00) |

### 4.5 Concurrent Operations

| Scenario | Handling |
|----------|----------|
| Simultaneous withdrawals | SQLite's serialized writes prevent race conditions |
| Read during write | SQLite WAL mode allows concurrent reads |

## 5. Frontend Error Handling

### Form Validation
- Required field indicators (asterisk *)
- Inline error messages below invalid fields
- Submit button disabled until form is valid

### API Error Display
- **Toast notifications** for success/error messages
- **Modal dialogs** for destructive action confirmations
- **Loading states** to prevent double-submissions

### Network Errors
- Retry logic for failed API calls (up to 3 attempts)
- User-friendly error message for network failures
- Graceful degradation when backend is unavailable

## 6. Global Error Handler (Backend)

```javascript
// All unhandled errors are caught by this middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again.'
  });
});
```
