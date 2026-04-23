const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deposito_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    yearly_return REAL NOT NULL CHECK(yearly_return > 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    deposito_type_id TEXT NOT NULL,
    balance REAL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (deposito_type_id) REFERENCES deposito_types(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'withdraw')),
    amount REAL NOT NULL CHECK(amount > 0),
    balance_before REAL NOT NULL,
    balance_after REAL NOT NULL,
    interest_earned REAL,
    months_elapsed INTEGER,
    transaction_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );

  CREATE INDEX IF NOT EXISTS idx_accounts_customer ON accounts(customer_id);
  CREATE INDEX IF NOT EXISTS idx_accounts_deposito ON accounts(deposito_type_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
`);

// Seed default deposito types if none exist
const count = db.prepare('SELECT COUNT(*) as count FROM deposito_types').get();
if (count.count === 0) {
  const { v4: uuidv4 } = require('uuid');
  const insert = db.prepare('INSERT INTO deposito_types (id, name, yearly_return) VALUES (?, ?, ?)');
  
  const seedData = [
    { name: 'Deposito Bronze', yearly_return: 3.0 },
    { name: 'Deposito Silver', yearly_return: 5.0 },
    { name: 'Deposito Gold', yearly_return: 7.0 },
  ];

  const insertMany = db.transaction((types) => {
    for (const type of types) {
      insert.run(uuidv4(), type.name, type.yearly_return);
    }
  });

  insertMany(seedData);
  console.log('✅ Seeded default deposito types');
}

module.exports = db;
