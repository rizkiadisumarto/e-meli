const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let pool = null;

// Convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
function convertParams(sql, params = []) {
  let idx = 0;
  const converted = sql.replace(/\?/g, () => `$${++idx}`);
  return { sql: converted, params };
}

async function initializeDb() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  await pool.query(schema);
  console.log('✅ Database PostgreSQL initialized successfully');
  return pool;
}

function queryAll(sql, params = []) {
  const safeParams = params.map(p => p === undefined ? null : p);
  const { sql: pgSql, params: pgParams } = convertParams(sql, safeParams);
  return pool.query(pgSql, pgParams).then(r => r.rows);
}

function queryGet(sql, params = []) {
  const safeParams = params.map(p => p === undefined ? null : p);
  const { sql: pgSql, params: pgParams } = convertParams(sql, safeParams);
  return pool.query(pgSql, pgParams).then(r => r.rows[0] || null);
}

async function queryRun(sql, params = []) {
  const safeParams = params.map(p => p === undefined ? null : p);
  const { sql: pgSql, params: pgParams } = convertParams(sql, safeParams);

  // For INSERT, add RETURNING id if not already present
  let finalSql = pgSql;
  if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
    finalSql = pgSql.replace(/;$/, '') + ' RETURNING id';
  }

  const result = await pool.query(finalSql, pgParams);
  const lastId = result.rows[0] ? result.rows[0].id : 0;
  return { lastInsertRowid: lastId, changes: result.rowCount };
}

function getDb() { return pool; }
function saveDb() { /* no-op: PostgreSQL persists automatically */ }

module.exports = { initializeDb, getDb, saveDb, queryAll, queryGet, queryRun };
