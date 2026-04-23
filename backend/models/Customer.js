const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Customer {
  /**
   * Get all customers
   */
  static getAll() {
    return db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
  }

  /**
   * Get a customer by ID, including their accounts
   */
  static getById(id) {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) return null;

    const accounts = db.prepare(`
      SELECT a.*, dt.name as deposito_type_name, dt.yearly_return
      FROM accounts a
      JOIN deposito_types dt ON a.deposito_type_id = dt.id
      WHERE a.customer_id = ?
      ORDER BY a.created_at DESC
    `).all(id);

    return { ...customer, accounts };
  }

  /**
   * Create a new customer
   */
  static create(name) {
    const id = uuidv4();
    db.prepare('INSERT INTO customers (id, name) VALUES (?, ?)').run(id, name);
    return this.getById(id);
  }

  /**
   * Update a customer's name
   */
  static update(id, name) {
    const result = db.prepare(
      'UPDATE customers SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, id);
    if (result.changes === 0) return null;
    return this.getById(id);
  }

  /**
   * Delete a customer (only if no active accounts)
   */
  static delete(id) {
    const accounts = db.prepare('SELECT COUNT(*) as count FROM accounts WHERE customer_id = ?').get(id);
    if (accounts.count > 0) {
      throw { status: 409, message: 'Cannot delete customer with active accounts. Please delete their accounts first.' };
    }
    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = Customer;
