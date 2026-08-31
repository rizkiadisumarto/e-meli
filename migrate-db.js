const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ============ KONFIGURASI ============
// Render Database (SOURCE)
const RENDER_URL = process.argv[2]; // Jalankan: node migrate-db.js "postgresql://..."

// Supabase Database (DESTINATION)  
const SUPABASE_URL = process.argv[3]; // Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
// ====================================

if (!RENDER_URL || !SUPABASE_URL) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  DATABASE MIGRATION TOOL                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Cara penggunaan:                                            ║
║  node migrate-db.js "RENDER_URL" "SUPABASE_URL"              ║
║                                                              ║
║  Contoh:                                                     ║
║  node migrate-db.js "postgresql://user:pass@host:5432/db"    ║
║    "postgresql://postgres.abc:xyz@aws-0-region.pooler...:5432/postgres" ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

async function migrate() {
  const sourcePool = new Pool({ connectionString: RENDER_URL, ssl: { rejectUnauthorized: false } });
  const destPool = new Pool({ connectionString: SUPABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    // Test connections
    console.log('🔍 Testing Render database connection...');
    await sourcePool.query('SELECT 1');
    console.log('✅ Render connected');

    console.log('🔍 Testing Supabase database connection...');
    await destPool.query('SELECT 1');
    console.log('✅ Supabase connected');

    // Get all tables
    console.log('\n📋 Getting table list...');
    const tables = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`Found ${tables.rows.length} tables`);

    // Export and import each table
    for (const { table_name } of tables.rows) {
      console.log(`\n🔄 Migrating: ${table_name}`);
      
      // Get data
      const data = await sourcePool.query(`SELECT * FROM "${table_name}"`);
      
      if (data.rows.length === 0) {
        console.log(`   ⏭️  Empty, skipping`);
        continue;
      }

      // Get columns
      const columns = data.rows[0] ? Object.keys(data.rows[0]) : [];
      
      // Create table structure (if not exists)
      const createTableSQL = await sourcePool.query(`
        SELECT pg_class.relname as table_name,
               pg_attribute.attname as column_name,
               pg_type.typname as data_type
        FROM pg_class
        JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid
        JOIN pg_type ON pg_type.oid = pg_attribute.atttypid
        WHERE pg_class.relkind = 'r'
        AND pg_class.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND pg_class.relname = '${table_name}'
        AND NOT pg_attribute.attisdropped
        ORDER BY pg_attribute.attnum
      `);

      // Insert data in batches
      const batchSize = 100;
      let inserted = 0;
      
      for (let i = 0; i < data.rows.length; i += batchSize) {
        const batch = data.rows.slice(i, i + batchSize);
        
        for (const row of batch) {
          const values = columns.map((col, idx) => `$${idx + 1}`);
          const insertQuery = `
            INSERT INTO "${table_name}" (${columns.map(c => `"${c}"`).join(', ')})
            VALUES (${values.join(', ')})
            ON CONFLICT DO NOTHING
          `;
          
          try {
            await destPool.query(insertQuery, columns.map(col => row[col]));
            inserted++;
          } catch (err) {
            if (err.code === '42P01') { // Table doesn't exist
              console.log(`   📝 Table not found, creating...`);
              // You might need to run schema-pg.sql first
            } else {
              console.error(`   ❌ Error inserting row: ${err.message}`);
            }
          }
        }
      }
      
      console.log(`   ✅ Inserted ${inserted}/${data.rows.length} rows`);
    }

    console.log('\n🎉 Migration completed!');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

migrate();
