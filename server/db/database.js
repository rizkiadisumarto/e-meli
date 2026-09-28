const path = require('path');
const fs = require('fs');

let db = null;
let isPostgres = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Koneksi ke database dengan retry untuk error transient
 * (pooler baru bangun, jeda jaringan, DNS). Error autentifikasi TIDAK diretry
 * karena tidak akan membaik sendiri — lebih baik gagal cepat dan jelas.
 */
async function connectWithRetry(pool, tries = 4) {
  let lastErr;
  for (let i = 1; i <= tries; i++) {
    try {
      return await pool.connect();
    } catch (err) {
      lastErr = err;
      const authFailed = err.code === '28P01' || err.code === '28000' || /password authentication failed/i.test(err.message || '');
      console.error(`⚠️  Koneksi database gagal (${i}/${tries})${authFailed ? ' — AUTENTIKASI' : ''}: ${err.message}`);
      if (authFailed) break; // password salah / user tidak ada → stop, jangan buang waktu
      if (i < tries) await sleep(i * 2000);
    }
  }
  throw lastErr;
}

async function initializeDb() {
  if (db) return db;

  const DATABASE_URL = process.env.DATABASE_URL;

  if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
    // PostgreSQL (Production - Render.com)
    isPostgres = true;
    const { Pool } = require('pg');
    db = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Batasi waktu tunggu: kalau DB tak terjangkau, gagal cepat
      // daripada menggantung sehingga aplikasi tidak pernah membuka port.
      connectionTimeoutMillis: 10000,
      // Koneksi idle dipertahankan 5 menit (bukan 30 detik) supaya request
      // pertama setelah sepi tidak membayar handshake TLS + auth lagi
      // (terukur ±960 ms vs ±350 ms saat koneksi masih hangat).
      idleTimeoutMillis: 300000,
      // TCP keepalive agar koneksi mati-senyap langsung terdeteksi
      keepAlive: true,
      keepAliveInitialDelayMillis: 30000,
      max: 10,
    });

    // Test connection
    const client = await connectWithRetry(db);
    console.log('✅ PostgreSQL connected successfully');

    // Run schema
    const schemaPath = path.join(__dirname, 'schema-pg.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    console.log('✅ PostgreSQL schema initialized');

    // Fix sequences to prevent duplicate key errors
    const tables = ['transactions', 'event_transactions', 'categories', 'members', 'events', 'users', 'event_participants', 'event_rundown', 'event_tasks', 'event_budget', 'dues_settings', 'dues_payments'];
    for (const table of tables) {
      try {
        await client.query(`SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM ${table}), 1))`);
      } catch (e) { /* skip */ }
    }
    console.log('✅ PostgreSQL sequences synced');

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
    const DB_PATH = path.join(__dirname, 'emeli.db');

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

// Convert PostgreSQL $1,$2 placeholders to SQLite ? placeholders
function toSqlite(sql) {
  return sql.replace(/\$\d+/g, '?');
}

// Query helpers for SQLite
function queryAll(sql, params = []) {
  if (isPostgres) {
    return db.query(sql, params).then(res => res.rows);
  }
  const stmt = db.prepare(toSqlite(sql));
  return stmt.all(...params);
}

function queryGet(sql, params = []) {
  if (isPostgres) {
    return db.query(sql, params).then(res => res.rows[0] || null);
  }
  const stmt = db.prepare(toSqlite(sql));
  return stmt.get(...params) || null;
}

function queryRun(sql, params = []) {
  if (isPostgres) {
    return db.query(sql, params).then(res => ({
      lastInsertRowid: res.rows[0]?.id,
      changes: res.rowCount
    }));
  }
  const stmt = db.prepare(toSqlite(sql));
  const result = stmt.run(...params);
  return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
}

// Async versions for PostgreSQL
async function queryAllAsync(sql, params = []) {
  if (isPostgres) {
    const res = await db.query(sql, params);
    return res.rows;
  }
  const stmt = db.prepare(toSqlite(sql));
  return stmt.all(...params);
}

async function queryGetAsync(sql, params = []) {
  if (isPostgres) {
    const res = await db.query(sql, params);
    return res.rows[0] || null;
  }
  const stmt = db.prepare(toSqlite(sql));
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
  const sqliteSql = toSqlite(sql);
  // Handle RETURNING clause for SQLite
  if (/\bRETURNING\b/i.test(sqliteSql)) {
    const stmt = db.prepare(sqliteSql);
    const row = stmt.get(...params);
    return {
      lastInsertRowid: row?.id || db.prepare('SELECT last_insert_rowid() as id').get().id,
      changes: 1
    };
  }
  const stmt = db.prepare(sqliteSql);
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
