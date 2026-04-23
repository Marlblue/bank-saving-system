const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

/**
 * @swagger
 * /api/accounts/{id}/deposit:
 *   post:
 *     summary: Deposit money into an account
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, transaction_date]
 *             properties:
 *               amount:
 *                 type: number
 *               transaction_date:
 *                 type: string
 *                 format: date
 */
exports.deposit = (req, res, next) => {
  try {
    const { amount, transaction_date } = req.body;
    const accountId = req.params.id;

    // Validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }
    if (!transaction_date || !isValidDate(transaction_date)) {
      return res.status(400).json({ success: false, error: 'Valid transaction date is required (YYYY-MM-DD)' });
    }

    const result = Transaction.deposit(accountId, parseFloat(amount), transaction_date);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * @swagger
 * /api/accounts/{id}/withdraw:
 *   post:
 *     summary: Withdraw money from an account with interest calculation
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, transaction_date]
 *             properties:
 *               amount:
 *                 type: number
 *               transaction_date:
 *                 type: string
 *                 format: date
 */
exports.withdraw = (req, res, next) => {
  try {
    const { amount, transaction_date } = req.body;
    const accountId = req.params.id;

    // Validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }
    if (!transaction_date || !isValidDate(transaction_date)) {
      return res.status(400).json({ success: false, error: 'Valid transaction date is required (YYYY-MM-DD)' });
    }

    const result = Transaction.withdraw(accountId, parseFloat(amount), transaction_date);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * @swagger
 * /api/accounts/{id}/transactions:
 *   get:
 *     summary: Get transaction history for an account
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
exports.getHistory = (req, res, next) => {
  try {
    const account = Account.getById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const transactions = Transaction.getByAccountId(req.params.id);
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

/**
 * Validate date format YYYY-MM-DD
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
