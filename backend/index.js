require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const errorHandler = require('./middleware/errorHandler');

// Initialize database (creates tables + seeds data on first run)
require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : undefined; // undefined = allow all origins in dev

app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Bank Saving System API Docs'
}));

// Routes
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/deposito-types', require('./routes/depositoTypeRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Bank Saving System API is running', timestamp: new Date().toISOString() });
});

// Dashboard stats endpoint
app.get('/api/dashboard', (req, res) => {
  try {
    const db = require('./config/database');
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get().count;
    const totalBalance = db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM accounts').get().total;
    const depositoTypeCount = db.prepare('SELECT COUNT(*) as count FROM deposito_types').get().count;
    const recentTransactions = db.prepare(`
      SELECT t.*, a.customer_id, c.name as customer_name
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN customers c ON a.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        customer_count: customerCount,
        account_count: accountCount,
        total_balance: totalBalance,
        deposito_type_count: depositoTypeCount,
        recent_transactions: recentTransactions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Global error handler
app.use(errorHandler);

// Start server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`\n🏦 Bank Saving System API running on http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`);
  console.log(`🔍 Health Check: http://${HOST}:${PORT}/api/health\n`);
});

module.exports = app;
