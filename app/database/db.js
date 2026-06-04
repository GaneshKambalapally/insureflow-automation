/**
 * InsureFlow - SQLite Database (sql.js with file persistence)
 * Pure JS SQLite — no native binary required
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = path.resolve(process.env.DB_PATH || './database/insureflow.db');

let db = null;
let SQL = null;

/**
 * Save in-memory db to disk
 */
function persist() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Initialize and return db (singleton)
 */
async function initDb() {
  if (db) return db;
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  createTables();
  return db;
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    role TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_number TEXT UNIQUE NOT NULL, holder_id INTEGER NOT NULL,
    plan_type TEXT NOT NULL, premium_amount REAL NOT NULL, sum_assured REAL NOT NULL,
    start_date DATE NOT NULL, end_date DATE NOT NULL, due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', agent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (holder_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_ref TEXT UNIQUE NOT NULL, policy_id INTEGER NOT NULL,
    amount REAL NOT NULL, payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', remarks TEXT, failure_reason TEXT,
    retry_count INTEGER DEFAULT 0, paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_number TEXT UNIQUE NOT NULL, policy_id INTEGER NOT NULL, claimant_id INTEGER NOT NULL,
    amount REAL NOT NULL, reason TEXT NOT NULL, description TEXT, documents TEXT,
    status TEXT NOT NULL DEFAULT 'pending', reviewed_by INTEGER,
    approved_amount REAL, rejection_reason TEXT,
    filed_at DATETIME DEFAULT CURRENT_TIMESTAMP, settled_at DATETIME,
    FOREIGN KEY (policy_id) REFERENCES policies(id), FOREIGN KEY (claimant_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS refunds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    refund_ref TEXT UNIQUE NOT NULL, payment_id INTEGER NOT NULL,
    amount REAL NOT NULL, reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'initiated', processed_by INTEGER, processed_at DATETIME,
    initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
  )`);
  persist();
  console.log('✅ Database tables initialized');
}

/**
 * Execute a query returning rows
 * @param {string} sql
 * @param {Array} params
 * @returns {Array}
 */
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push(row);
  }
  stmt.free();
  return rows;
}

/**
 * Execute a mutating query (INSERT/UPDATE/DELETE)
 * @param {string} sql
 * @param {Array} params
 * @returns {{ lastInsertRowid: number, changes: number }}
 */
function run(sql, params = []) {
  db.run(sql, params);
  const lastInsertRowid = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] || 0;
  const changes = db.exec('SELECT changes()')[0]?.values[0][0] || 0;
  persist();
  return { lastInsertRowid, changes };
}

/**
 * Get single row
 */
function get(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

module.exports = { initDb, query, run, get, persist };
