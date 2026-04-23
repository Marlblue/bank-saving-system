const Account = require('../models/Account');

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customer_id:
 *           type: string
 *           format: uuid
 *         customer_name:
 *           type: string
 *           example: "John Doe"
 *         deposito_type_id:
 *           type: string
 *           format: uuid
 *         deposito_type_name:
 *           type: string
 *           example: "Deposito Gold"
 *         yearly_return:
 *           type: number
 *           example: 7.0
 *         balance:
 *           type: number
 *           example: 1000000
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts
 *     description: Returns all accounts with their customer names and deposito type information.
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: List of accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
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
 *     summary: Get an account by ID
 *     description: Returns a single account with customer name, deposito type, and balance details.
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account UUID
 *     responses:
 *       200:
 *         description: Account found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     description: Creates a new savings account linked to a customer and a deposito type. Initial balance is 0.
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
 *                 format: uuid
 *                 description: UUID of the customer who owns this account
 *               deposito_type_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the deposito type for this account
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Customer or Deposito type not found
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
 *     description: Updates the deposito type of an existing account.
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deposito_type_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the new deposito type
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account or Deposito type not found
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
 *     description: Deletes an account and all its associated transactions.
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account UUID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       404:
 *         description: Account not found
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
