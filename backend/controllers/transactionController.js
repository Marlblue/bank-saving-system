const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         account_id:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [deposit, withdraw]
 *         amount:
 *           type: number
 *           example: 1000000
 *         balance_before:
 *           type: number
 *           example: 0
 *         balance_after:
 *           type: number
 *           example: 1000000
 *         interest_earned:
 *           type: number
 *           nullable: true
 *           description: Interest earned (only for withdrawals)
 *         months_elapsed:
 *           type: integer
 *           nullable: true
 *           description: Months since last deposit (only for withdrawals)
 *         transaction_date:
 *           type: string
 *           format: date
 *           example: "2026-04-01"
 *         created_at:
 *           type: string
 *           format: date-time
 *     WithdrawalCalculation:
 *       type: object
 *       properties:
 *         starting_balance:
 *           type: number
 *           example: 1000000
 *         yearly_return:
 *           type: number
 *           example: 7.0
 *         monthly_return:
 *           type: number
 *           example: 0.0058
 *         months_elapsed:
 *           type: integer
 *           example: 6
 *         interest_earned:
 *           type: number
 *           example: 35000
 *         ending_balance_with_interest:
 *           type: number
 *           example: 1035000
 *         withdrawal_amount:
 *           type: number
 *           example: 500000
 *         final_balance:
 *           type: number
 *           example: 535000
 */

/**
 * @swagger
 * /api/accounts/{id}/deposit:
 *   post:
 *     summary: Deposit money into an account
 *     description: Adds money to an account balance. Transaction date is user-specified.
 *     tags: [Transactions]
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
 *             required: [amount, transaction_date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000000
 *                 description: Amount to deposit (must be > 0)
 *               transaction_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *                 description: Date of the deposit (YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     new_balance:
 *                       type: number
 *                       example: 1000000
 *       400:
 *         description: Invalid amount or date format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Account not found
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
 *     description: |
 *       Withdraws money from an account. The system first calculates accrued interest based on:
 *       - `monthly_return = yearly_return / 12 / 100`
 *       - `interest = starting_balance × months_elapsed × monthly_return`
 *       - `ending_balance = starting_balance + interest`
 *       - `final_balance = ending_balance - withdrawal_amount`
 *       
 *       The months elapsed is calculated from the last deposit date to the withdrawal date.
 *       The full calculation breakdown is returned in the response.
 *     tags: [Transactions]
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
 *             required: [amount, transaction_date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500000
 *                 description: Amount to withdraw (must be > 0 and <= ending balance with interest)
 *               transaction_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-01"
 *                 description: Date of the withdrawal (YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: Withdrawal successful with interest calculation breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     calculation:
 *                       $ref: '#/components/schemas/WithdrawalCalculation'
 *       400:
 *         description: Invalid amount or date format
 *       404:
 *         description: Account not found
 *       422:
 *         description: Insufficient balance or no balance to withdraw
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Insufficient balance. Maximum withdrawable amount (including interest) is 1035000.00"
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
 *     description: Returns all transactions (deposits and withdrawals) for a specific account, sorted by most recent first.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account UUID
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
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
 *                     $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Account not found
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
