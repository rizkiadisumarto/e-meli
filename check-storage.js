require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function checkStorage() {
  const client = await pool.connect();
  try {
    const dbSize = await client.query('SELECT pg_size_pretty(pg_database_size(current_database())) as size');
    console.log('=== DATABASE STORAGE ===');
    console.log('Total Size:', dbSize.rows[0].size);

    const tableSize = await client.query(`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size('public.' || tablename)) as total_size,
        pg_size_pretty(pg_relation_size('public.' || tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(('public.' || tablename)::regclass)) as index_size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('public.' || tablename) DESC
    `);

    console.log('\n=== PER TABLE SIZE ===');
    for (const row of tableSize.rows) {
      console.log(`${row.tablename}: ${row.total_size} (data: ${row.table_size}, index: ${row.index_size})`);
    }

    const tables = ['users', 'members', 'categories', 'transactions', 'events', 'event_participants', 'event_budget', 'event_tasks', 'event_transactions', 'dues_settings', 'dues_payments', 'settings'];
    console.log('\n=== ROW COUNTS ===');
    for (const table of tables) {
      const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${count.rows[0].count} rows`);
    }
  } finally {
    client.release();
    pool.end();
  }
}

checkStorage();
