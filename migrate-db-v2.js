const { Pool } = require('pg');
const fs = require('fs');

const RENDER_URL = process.argv[2];
const SUPABASE_URL = process.argv[3];

if (!RENDER_URL || !SUPABASE_URL) {
  console.log('Usage: node migrate-db-v2.js "RENDER_URL" "SUPABASE_URL"');
  process.exit(1);
}

// Order yang benar berdasarkan foreign key
const TABLE_ORDER = [
  'users',
  'members',
  'categories',
  'settings',
  'transactions',
  'dues_settings',
  'dues_payments',
  'events',
  'event_budget',
  'event_participants',
  'event_rundown',
  'event_tasks',
  'event_transactions'
];

async function migrate() {
  const src = new Pool({ connectionString: RENDER_URL, ssl: { rejectUnauthorized: false } });
  const dst = new Pool({ connectionString: SUPABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('🔍 Connecting to Render...');
    await src.query('SELECT 1');
    console.log('✅ Render connected');

    console.log('🔍 Connecting to Supabase...');
    await dst.query('SELECT 1');
    console.log('✅ Supabase connected');

    // Disable foreign key checks
    console.log('\n🔒 Disabling foreign key checks...');
    await dst.query('SET session_replication_role = replica;');

    for (const table of TABLE_ORDER) {
      console.log(`\n🔄 Migrating: ${table}`);

      const data = await src.query(`SELECT * FROM "${table}"`);
      if (data.rows.length === 0) {
        console.log(`   ⏭️  Empty, skipping`);
        continue;
      }

      const columns = Object.keys(data.rows[0]);
      let inserted = 0;

      for (const row of data.rows) {
        const values = columns.map(col => row[col]);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const insertQuery = `
          INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT DO NOTHING
        `;

        try {
          await dst.query(insertQuery, values);
          inserted++;
        } catch (err) {
          // Skip individual row errors
        }
      }

      console.log(`   ✅ Inserted ${inserted}/${data.rows.length} rows`);
    }

    // Re-enable foreign key checks
    console.log('\n🔓 Re-enabling foreign key checks...');
    await dst.query('SET session_replication_role = DEFAULT;');

    // Verify migration
    console.log('\n📊 Verification:');
    for (const table of TABLE_ORDER) {
      const srcCount = await src.query(`SELECT COUNT(*) FROM "${table}"`);
      const dstCount = await dst.query(`SELECT COUNT(*) FROM "${table}"`);
      const match = srcCount.rows[0].count === dstCount.rows[0].count ? '✅' : '❌';
      console.log(`   ${match} ${table}: Render=${srcCount.rows[0].count} | Supabase=${dstCount.rows[0].count}`);
    }

    console.log('\n🎉 Migration completed!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    await src.end();
    await dst.end();
  }
}

migrate();
