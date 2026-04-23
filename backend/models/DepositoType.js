const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class DepositoType {
  /**
   * Get all deposito types
   */
  static getAll() {
    return db.prepare('SELECT * FROM deposito_types ORDER BY yearly_return ASC').all();
  }

  /**
   * Get a deposito type by ID
   */
  static getById(id) {
    return db.prepare('SELECT * FROM deposito_types WHERE id = ?').get(id) || null;
  }

  /**
   * Create a new deposito type
   */
  static create(name, yearlyReturn) {
    // Check for duplicate name
    const existing = db.prepare('SELECT id FROM deposito_types WHERE LOWER(name) = LOWER(?)').get(name);
    if (existing) {
      throw { status: 409, message: 'Deposito type name already exists' };
    }

    const id = uuidv4();
    db.prepare('INSERT INTO deposito_types (id, name, yearly_return) VALUES (?, ?, ?)').run(id, name, yearlyReturn);
    return this.getById(id);
  }

  /**
   * Update a deposito type
   */
  static update(id, name, yearlyReturn) {
    // Check for duplicate name (excluding current)
    if (name) {
      const existing = db.prepare('SELECT id FROM deposito_types WHERE LOWER(name) = LOWER(?) AND id != ?').get(name, id);
      if (existing) {
        throw { status: 409, message: 'Deposito type name already exists' };
      }
    }

    const current = this.getById(id);
    if (!current) return null;

    const updatedName = name || current.name;
    const updatedReturn = yearlyReturn !== undefined ? yearlyReturn : current.yearly_return;

    db.prepare(
      'UPDATE deposito_types SET name = ?, yearly_return = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(updatedName, updatedReturn, id);

    return this.getById(id);
  }

  /**
   * Delete a deposito type (only if not assigned to any accounts)
   */
  static delete(id) {
    const accounts = db.prepare('SELECT COUNT(*) as count FROM accounts WHERE deposito_type_id = ?').get(id);
    if (accounts.count > 0) {
      throw { status: 409, message: 'Cannot delete deposito type that is assigned to active accounts' };
    }
    const result = db.prepare('DELETE FROM deposito_types WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = DepositoType;
