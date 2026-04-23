const Account = require('../models/Account');

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: List of accounts
 */
exports.getAll = (req, res, next) => {
  try {
    const accounts = Account.getAll();
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get an account by ID with transactions
 *     tags: [Accounts]
 */
exports.getById = (req, res, next) => {
  try {
    const account = Account.getById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, deposito_type_id]
 *             properties:
 *               customer_id:
 *                 type: string
 *               deposito_type_id:
 *                 type: string
 */
exports.create = (req, res, next) => {
  try {
    const { customer_id, deposito_type_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, error: 'Customer ID is required' });
    }
    if (!deposito_type_id) {
      return res.status(400).json({ success: false, error: 'Deposito type ID is required' });
    }

    const account = Account.create(customer_id, deposito_type_id);
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update an account
 *     tags: [Accounts]
 */
exports.update = (req, res, next) => {
  try {
    const { deposito_type_id } = req.body;

    const account = Account.update(req.params.id, deposito_type_id);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    res.json({ success: true, data: account });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Delete an account
 *     tags: [Accounts]
 */
exports.delete = (req, res, next) => {
  try {
    const deleted = Account.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};
