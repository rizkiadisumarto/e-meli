const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'kas.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;
let dbReady = null;

function initializeDb() {
  if (dbReady) return dbReady;
  
  dbReady = initSqlJs().then(SQL => {
    try {
      // Load existing database if it exists
      if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
      } else {
        db = new SQL.Database();
      }
      
      // Run schema
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      db.run(schema);

      // Migration: add proof_image column to transactions if not exists
      try {
        db.run('ALTER TABLE transactions ADD COLUMN proof_image TEXT');
      } catch (e) {
        // Column already exists, ignore
      }

      saveDb();
      
      console.log('✅ Database initialized successfully');
      return db;
    } catch (err) {
      console.error('❌ Database initialization error:', err.message);
      throw err;
    }
  });
  
  return dbReady;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initializeDb() first.');
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper to run queries that return results (SELECT)
function queryAll(sql, params = []) {
  const safeParams = params.map(p => p === undefined ? null : p);
  const stmt = db.prepare(sql);
  if (safeParams.length) stmt.bind(safeParams);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper to get a single row
function queryGet(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper to run INSERT/UPDATE/DELETE and return changes info
function queryRun(sql, params = []) {
  const safeParams = params.map(p => p === undefined ? null : p);
  db.run(sql, safeParams);
  const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || 0;
  const changes = db.getRowsModified();
  saveDb();
  return { lastInsertRowid: lastId, changes };
}

module.exports = { initializeDb, getDb, saveDb, queryAll, queryGet, queryRun };
