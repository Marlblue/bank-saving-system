const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Account = require('./Account');

class Transaction {
  /**
   * Get all transactions for a specific account
   */
  static getByAccountId(accountId) {
    return db.prepare(
      'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC'
    ).all(accountId);
  }

  /**
   * Create a deposit transaction
   */
  static deposit(accountId, amount, transactionDate) {
    const account = Account.getById(accountId);
    if (!account) {
      throw { status: 404, message: 'Account not found' };
    }

    const balanceBefore = account.balance;
    const balanceAfter = Math.round((balanceBefore + amount) * 100) / 100;

    const id = uuidv4();
    
    const insertAndUpdate = db.transaction(() => {
      db.prepare(`
        INSERT INTO transactions (id, account_id, type, amount, balance_before, balance_after, transaction_date)
        VALUES (?, ?, 'deposit', ?, ?, ?, ?)
      `).run(id, accountId, amount, balanceBefore, balanceAfter, transactionDate);

      Account.updateBalance(accountId, balanceAfter);
    });

    insertAndUpdate();

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    return {
      transaction,
      new_balance: balanceAfter
    };
  }

  /**
   * Create a withdrawal transaction with interest calculation
   * 
   * Formula:
   *   monthly_return = yearly_return / 12 / 100
   *   interest = starting_balance * months_elapsed * monthly_return
   *   ending_balance = starting_balance + interest
   *   final_balance = ending_balance - withdrawal_amount
   */
  static withdraw(accountId, amount, transactionDate) {
    const account = Account.getById(accountId);
    if (!account) {
      throw { status: 404, message: 'Account not found' };
    }

    const startingBalance = account.balance;

    if (startingBalance <= 0) {
      throw { status: 422, message: 'Account has no balance to withdraw' };
    }

    // Get the last deposit date to calculate months elapsed
    const lastDeposit = db.prepare(`
      SELECT transaction_date FROM transactions 
      WHERE account_id = ? AND type = 'deposit'
      ORDER BY transaction_date DESC 
      LIMIT 1
    `).get(accountId);

    let monthsElapsed = 0;
    if (lastDeposit) {
      monthsElapsed = this.calculateMonthsDiff(lastDeposit.transaction_date, transactionDate);
    }

    // Ensure months is not negative
    if (monthsElapsed < 0) monthsElapsed = 0;

    // Calculate interest
    const yearlyReturn = account.yearly_return;
    const monthlyReturn = yearlyReturn / 12 / 100;
    const interestEarned = Math.round(startingBalance * monthsElapsed * monthlyReturn * 100) / 100;
    const endingBalance = Math.round((startingBalance + interestEarned) * 100) / 100;

    // Check if withdrawal amount exceeds ending balance
    if (amount > endingBalance) {
      throw {
        status: 422,
        message: `Insufficient balance. Maximum withdrawable amount (including interest) is ${endingBalance.toFixed(2)}`
      };
    }

    const finalBalance = Math.round((endingBalance - amount) * 100) / 100;

    const id = uuidv4();

    const insertAndUpdate = db.transaction(() => {
      db.prepare(`
        INSERT INTO transactions (id, account_id, type, amount, balance_before, balance_after, interest_earned, months_elapsed, transaction_date)
        VALUES (?, ?, 'withdraw', ?, ?, ?, ?, ?, ?)
      `).run(id, accountId, amount, startingBalance, finalBalance, interestEarned, monthsElapsed, transactionDate);

      Account.updateBalance(accountId, finalBalance);
    });

    insertAndUpdate();

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);

    return {
      transaction,
      calculation: {
        starting_balance: startingBalance,
        yearly_return: yearlyReturn,
        monthly_return: Math.round(monthlyReturn * 10000) / 10000,
        months_elapsed: monthsElapsed,
        interest_earned: interestEarned,
        ending_balance_with_interest: endingBalance,
        withdrawal_amount: amount,
        final_balance: finalBalance
      }
    };
  }

  /**
   * Calculate the number of months between two dates
   */
  static calculateMonthsDiff(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();

    return yearDiff * 12 + monthDiff;
  }
}

module.exports = Transaction;
