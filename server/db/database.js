const path = require('path');
const fs = require('fs');

let db = null;
let isPostgres = false;

async function initializeDb() {
  if (db) return db;

  const DATABASE_URL = process.env.DATABASE_URL;

  if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
    // PostgreSQL (Production - Render.com)
    isPostgres = true;
    const { Pool } = require('pg');
    db = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Test connection
    const client = await db.connect();
    console.log('✅ PostgreSQL connected successfully');

    // Run schema
    const schemaPath = path.join(__dirname, 'schema-pg.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    console.log('✅ PostgreSQL schema initialized');

    client.release();
    return db;
  } else {
    // SQLite (Local Development)
    isPostgres = false;
    let Database;
    try {
      Database = require('better-sqlite3');
    } catch (e) {
      console.error('');
      console.error('❌ better-sqlite3 tidak terinstall.');
      console.error('   Jalankan: npm install better-sqlite3');
      console.error('   Atau set environment variable DATABASE_URL untuk PostgreSQL');
      console.error('');
      process.exit(1);
    }
    const DB_PATH = path.join(__dirname, 'kas.db');

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('✅ SQLite database initialized successfully');
    return db;
  }
}

// Query helpers for SQLite
function queryAll(sql, params = []) {
  if (isPostgres) {
    return db.query(sql, params).then(res => res.rows);
  }
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function queryGet(sql, params = []) {
  if (isPostgres) {
    return db.query(sql, params).then(res => res.rows[0] || null);
  }
  const stmt = db.prepare(sql);
  return stmt.get(...params) || null;
}

function queryRun(sql, params = []) {
  if (isPostgres) {
    return db.query(sql, params).then(res => ({
      lastInsertRowid: res.rows[0]?.id,
      changes: res.rowCount
    }));
  }
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
}

// Async versions for PostgreSQL
async function queryAllAsync(sql, params = []) {
  if (isPostgres) {
    const res = await db.query(sql, params);
    return res.rows;
  }
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

async function queryGetAsync(sql, params = []) {
  if (isPostgres) {
    const res = await db.query(sql, params);
    return res.rows[0] || null;
  }
  const stmt = db.prepare(sql);
  return stmt.get(...params) || null;
}

async function queryRunAsync(sql, params = []) {
  if (isPostgres) {
    const res = await db.query(sql, params);
    return {
      lastInsertRowid: res.rows[0]?.id,
      changes: res.rowCount
    };
  }
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
}

function getDb() { return db; }
function getIsPostgres() { return isPostgres; }
function saveDb() { /* SQLite auto-persists with WAL, PostgreSQL auto-persists */ }

module.exports = {
  initializeDb,
  getDb,
  getIsPostgres,
  saveDb,
  queryAll,
  queryGet,
  queryRun,
  queryAllAsync,
  queryGetAsync,
  queryRunAsync
};
