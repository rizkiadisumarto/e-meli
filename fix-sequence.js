require('dotenv').config();
const { Pool } = require('pg');

async function fixSequences() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    const tables = ['transactions', 'event_transactions', 'categories', 'members', 'events', 'users', 'event_participants', 'event_rundown', 'event_tasks', 'event_budget', 'dues_settings', 'dues_payments'];

    for (const table of tables) {
      try {
        const seqName = `${table}_id_seq`;
        await client.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX(id) FROM ${table}), 1))`);
        console.log(`Fixed sequence for ${table}`);
      } catch (e) {
        // skip tables without serial sequences
      }
    }

    console.log('All sequences fixed!');
  } finally {
    client.release();
  }
  process.exit(0);
}

fixSequences().catch(err => { console.error(err); process.exit(1); });
