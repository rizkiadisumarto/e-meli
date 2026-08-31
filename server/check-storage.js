const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const c = await pool.connect();
  try {
    const db = await c.query('SELECT pg_size_pretty(pg_database_size(current_database())) as size');
    console.log('=== DATABASE STORAGE ===');
    console.log('Total Size:', db.rows[0].size);

    const ts = await c.query("SELECT tablename, pg_size_pretty(pg_total_relation_size('public.' || tablename)) as total_size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size('public.' || tablename) DESC");
    console.log('');
    console.log('=== PER TABLE ===');
    for (const r of ts.rows) {
      console.log(r.tablename + ': ' + r.total_size);
    }

    const tbls = ['users', 'members', 'categories', 'transactions', 'events', 'event_participants', 'event_budget', 'event_tasks', 'event_transactions', 'dues_settings', 'dues_payments', 'settings'];
    console.log('');
    console.log('=== ROW COUNTS ===');
    for (const t of tbls) {
      const cnt = await c.query('SELECT COUNT(*) FROM ' + t);
      console.log(t + ': ' + cnt.rows[0].count + ' rows');
    }
  } finally {
    c.release();
    pool.end();
  }
}

check();
