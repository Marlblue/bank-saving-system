const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Account {
  /**
   * Get all accounts with customer and deposito type info
   */
  static getAll() {
    return db.prepare(`
      SELECT a.*, 
             c.name as customer_name,
             dt.name as deposito_type_name,
             dt.yearly_return
      FROM accounts a
      JOIN customers c ON a.customer_id = c.id
      JOIN deposito_types dt ON a.deposito_type_id = dt.id
      ORDER BY a.created_at DESC
    `).all();
  }

  /**
   * Get a single account by ID with full details
   */
  static getById(id) {
    const account = db.prepare(`
      SELECT a.*, 
             c.name as customer_name,
             dt.name as deposito_type_name,
             dt.yearly_return
      FROM accounts a
      JOIN customers c ON a.customer_id = c.id
      JOIN deposito_types dt ON a.deposito_type_id = dt.id
      WHERE a.id = ?
    `).get(id);

    return account || null;
  }

  /**
   * Create a new account
   */
  static create(customerId, depositoTypeId) {
    // Validate customer exists
    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      throw { status: 404, message: 'Customer not found' };
    }

    // Validate deposito type exists
    const depositoType = db.prepare('SELECT id FROM deposito_types WHERE id = ?').get(depositoTypeId);
    if (!depositoType) {
      throw { status: 404, message: 'Deposito type not found' };
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO accounts (id, customer_id, deposito_type_id, balance) VALUES (?, ?, ?, 0)'
    ).run(id, customerId, depositoTypeId);

    return this.getById(id);
  }

  /**
   * Update an account's deposito type
   */
  static update(id, depositoTypeId) {
    if (depositoTypeId) {
      const depositoType = db.prepare('SELECT id FROM deposito_types WHERE id = ?').get(depositoTypeId);
      if (!depositoType) {
        throw { status: 404, message: 'Deposito type not found' };
      }
    }

    const current = this.getById(id);
    if (!current) return null;

    const updatedDepositoTypeId = depositoTypeId || current.deposito_type_id;

    db.prepare(
      'UPDATE accounts SET deposito_type_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(updatedDepositoTypeId, id);

    return this.getById(id);
  }

  /**
   * Delete an account
   */
  static delete(id) {
    // Delete associated transactions first
    db.prepare('DELETE FROM transactions WHERE account_id = ?').run(id);
    const result = db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Update account balance
   */
  static updateBalance(id, newBalance) {
    db.prepare(
      'UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(Math.round(newBalance * 100) / 100, id);
  }
}

module.exports = Account;
