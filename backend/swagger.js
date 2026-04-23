const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bank Saving System API',
      version: '1.0.0',
      description: `REST API for Bank Saving System — Manage customers, accounts, deposito types, and transactions with interest calculation.

## Interest Calculation Formula

When a customer withdraws money, the system calculates interest:
- \`monthly_return = yearly_return / 12 / 100\`
- \`interest = starting_balance × months_elapsed × monthly_return\`
- \`ending_balance = starting_balance + interest\`
- \`final_balance = ending_balance − withdrawal_amount\`

## Default Deposito Types
| Name | Yearly Return |
|------|--------------|
| Deposito Bronze | 3% |
| Deposito Silver | 5% |
| Deposito Gold | 7% |
`,
      contact: {
        name: 'Hilmy',
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.BACKEND_URL ? 'Production server' : 'Development server',
      },
    ],
    tags: [
      { name: 'Customers', description: 'Customer management (CRUD)' },
      { name: 'Accounts', description: 'Account management (CRUD) linked to customers and deposito types' },
      { name: 'Deposito Types', description: 'Deposito type management with yearly interest rates' },
      { name: 'Transactions', description: 'Deposit and withdrawal operations with interest calculation' },
    ],
  },
  apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
