/**
 * Backup database Supabase ke file SQL lokal (tanpa pg_dump — cukup Node).
 *
 * Isi dump: sequence -> tabel (DDL lengkap) -> constraint/index -> data (INSERT)
 *          -> setval sequence.
 *
 * Pakai :
 *   node server/backup-db.js                 # backup ke server/backups/ + verifikasi
 *   node server/backup-db.js --no-verify     # lewati verifikasi
 *   node server/backup-db.js --verify-only   # verifikasi dump terakhir saja
 *
 * Verifikasi = dump dijalankan di schema sementara lalu di-ROLLBACK,
 * jadi sintaks & data diuji penuh tanpa menyentuh data produksi.
 *
 * ⚠️ Folder backups/ mengandung data sensitif (hash password, gambar bukti)
 *    -> sudah masuk .gitignore. Jangan pernah di-commit ke repo publik.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const OUT_DIR = path.join(__dirname, 'backups');
const VERIFY_SCHEMA = 'verify_dump_tmp';

const args = process.argv.slice(2);
const VERIFY_ONLY = args.includes('--verify-only');
const DO_VERIFY = !args.includes('--no-verify');

const q = (id) => `"${String(id).replace(/"/g, '""')}"`;
const lit = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

async function buildDump(pool) {
  const lines = [];
  const stamp = new Date().toISOString();
  const meta = await pool.query('SELECT current_database() AS db, version() AS v');
  const tables = (await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE 'pg_%' ORDER BY tablename`
  )).rows.map((r) => r.tablename);
  const seqs = (await pool.query(
    `SELECT sequencename FROM pg_sequences WHERE schemaname='public' ORDER BY sequencename`
  )).rows.map((r) => r.sequencename);

  lines.push(`-- Backup database ${meta.rows[0].db} @ ${stamp}`);
  lines.push(`-- ${meta.rows[0].v.split(',')[0]}`);
  lines.push(`-- Tabel: ${tables.length} | Sequence: ${seqs.length}`);
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  // 1. Sequences harus ada duluan karena DEFAULT serial merujuk ke sana
  for (const s of seqs) lines.push(`CREATE SEQUENCE IF NOT EXISTS ${q(s)};`);
  lines.push('');

  // 2. Tabel dulu (semua), constraint menyusul — FK boleh merujuk tabel
  //    yang "belum kenal" selama semuanya sudah dibuat.
  const colCache = {};
  for (const t of tables) {
    const cols = (await pool.query(
      `SELECT a.attname AS name,
              format_type(a.atttypid, a.atttypmod) AS type,
              a.attnotnull AS notnull,
              pg_get_expr(ad.adbin, ad.adrelid) AS default_expr
       FROM pg_attribute a
       LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
       WHERE a.attrelid = $1::regclass AND a.attnum > 0 AND NOT a.attisdropped
       ORDER BY a.attnum`,
      [t]
    )).rows;
    colCache[t] = cols;

    lines.push(`CREATE TABLE IF NOT EXISTS ${q(t)} (`);
    lines.push(cols.map((c) => {
      let def = `  ${q(c.name)} ${c.type}`;
      if (c.default_expr) def += ` DEFAULT ${c.default_expr}`;
      if (c.notnull) def += ' NOT NULL';
      return def;
    }).join(',\n'));
    lines.push(');');
  }
  lines.push('');

  // 3. Constraint, index, RLS — PK/unique dulu, FK belakangan
  const addConstraints = async (t, types, label) => {
    const cons = (await pool.query(
      `SELECT conname, pg_get_constraintdef(oid) AS def
       FROM pg_constraint WHERE conrelid = $1::regclass AND contype::text = ANY($2::text[])
       ORDER BY conname`,
      [t, types]
    )).rows;
    for (const c of cons) lines.push(`ALTER TABLE ${q(t)} ADD CONSTRAINT ${q(c.conname)} ${c.def};`);
    if (cons.length) lines.push(`-- ${label} ${t}: ${cons.length}`);
  };

  for (const t of tables) await addConstraints(t, ['p', 'u', 'c'], 'constraint');
  lines.push('');
  for (const t of tables) await addConstraints(t, ['f'], 'foreign key');
  lines.push('');

  for (const t of tables) {
    const idx = (await pool.query(
      `SELECT indexname, indexdef FROM pg_indexes
       WHERE schemaname='public' AND tablename=$1
         AND NOT EXISTS (SELECT 1 FROM pg_constraint c
                         WHERE c.conrelid = $1::regclass AND c.conname = pg_indexes.indexname)`,
      [t]
    )).rows;
    for (const i of idx) lines.push(`${i.indexdef.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS')};`);

    const rls = await pool.query(
      `SELECT relrowsecurity FROM pg_class WHERE oid = $1::regclass`, [t]
    );
    if (rls.rows[0].relrowsecurity) lines.push(`ALTER TABLE ${q(t)} ENABLE ROW LEVEL SECURITY;`);
  }
  lines.push('');

  // 4. Data — urutkan tabel sesuai dependensi FK (parent duluan)
  const fkEdges = (await pool.query(`
    SELECT pc.relname AS child, pr.relname AS parent
    FROM pg_constraint c
    JOIN pg_class pc ON pc.oid = c.conrelid
    JOIN pg_class pr ON pr.oid = c.confrelid
    JOIN pg_namespace n ON n.oid = pc.relnamespace
    WHERE c.contype = 'f' AND n.nspname = 'public'`)).rows;
  const parentsOf = {};
  for (const t of tables) parentsOf[t] = [];
  for (const e of fkEdges) if (parentsOf[e.child] && tables.includes(e.parent)) parentsOf[e.child].push(e.parent);

  const remaining = new Set(tables);
  const dataOrder = [];
  let progress = true;
  while (remaining.size && progress) {
    progress = false;
    for (const t of [...remaining]) {
      if (parentsOf[t].every((p) => !remaining.has(p))) {
        dataOrder.push(t);
        remaining.delete(t);
        progress = true;
      }
    }
  }
  for (const t of tables) if (remaining.has(t)) { dataOrder.push(t); remaining.delete(t); } // FK melingkar

  for (const t of dataOrder) {
    const cols = colCache[t];
    const colNames = cols.map((c) => c.name);
    const selectList = colNames.map((c) => `${q(c)}::text AS ${q(c)}`).join(', ');

    // baris urut sesuai primary key supaya FK antar-baris tidak bentrok
    const pk = (await pool.query(
      `SELECT a.attname AS name
       FROM pg_constraint c
       CROSS JOIN LATERAL unnest(c.conkey) AS k(attnum)
       JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
       WHERE c.conrelid = $1::regclass AND c.contype = 'p'`,
      [t]
    )).rows.map((r) => r.name);
    const orderBy = (pk.length ? pk : colNames.includes('id') ? ['id'] : [])
      .map((c) => `${q(c)} ASC`).join(', ');

    const data = (await pool.query(
      `SELECT ${selectList} FROM ${q(t)}${orderBy ? ` ORDER BY ${orderBy}` : ''}`
    )).rows;
    for (const r of data) {
      const vals = colNames.map((c) => lit(r[c])).join(', ');
      lines.push(`INSERT INTO ${q(t)} (${colNames.map(q).join(', ')}) VALUES (${vals});`);
    }
    lines.push(`-- ${t}: ${data.length} baris`);
  }

  // 3. Sequence positions
  for (const s of seqs) {
    try {
      const st = (await pool.query(`SELECT last_value, is_called FROM ${q(s)}`)).rows[0];
      lines.push(`SELECT setval(${lit(s)}, ${st.last_value}, ${st.is_called});`);
    } catch (e) {
      lines.push(`-- setval ${s} dilewati: ${e.message}`);
    }
  }

  lines.push('');
  lines.push('COMMIT;');
  return lines.join('\n') + '\n';
}

async function verify(pool, dump) {
  // Jalankan dump penuh di schema sementara lalu rollback:
  // membuktikan SQL valid dan data bisa di-insert, tanpa mengubah produksi.
  // BEGIN/COMMIT bawaan dump dibuang — transaksinya dipegang oleh fungsi ini.
  const body = dump
    .split(/\r?\n/)
    .filter((l) => !/^\s*(BEGIN|COMMIT);\s*$/i.test(l))
    .join('\n');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA ${q(VERIFY_SCHEMA)}`);
    await client.query(`SET LOCAL search_path TO ${q(VERIFY_SCHEMA)}`);
    await client.query(body);
    const check = await client.query(
      `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema=$1`,
      [VERIFY_SCHEMA]
    );
    await client.query('ROLLBACK');
    return { ok: true, tables: check.rows[0].n };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return { ok: false, error: err.message };
  } finally {
    client.release();
  }
}

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  let file;
  let dump;

  if (VERIFY_ONLY) {
    const list = fs.existsSync(OUT_DIR)
      ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.sql')).sort()
      : [];
    if (!list.length) { console.error('Tidak ada dump di', OUT_DIR); process.exit(1); }
    file = path.join(OUT_DIR, list[list.length - 1]);
    dump = fs.readFileSync(file, 'utf8');
    console.log('Verifikasi dump:', file);
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    dump = await buildDump(pool);
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    file = path.join(OUT_DIR, `emeli-${ts}.sql`);
    fs.writeFileSync(file, dump, 'utf8');
    const rows = (dump.match(/^INSERT INTO/gm) || []).length;
    console.log(`✅ Dump dibuat: ${file}`);
    console.log(`   ${(fs.statSync(file).size / 1024).toFixed(1)} KB, ${rows} INSERT`);
    // simpan juga salinan terbaru
    fs.writeFileSync(path.join(OUT_DIR, 'latest.sql'), dump, 'utf8');
  }

  if (DO_VERIFY || VERIFY_ONLY) {
    const v = await verify(pool, dump);
    if (v.ok) console.log(`✅ Verifikasi LULUS — ${v.tables} tabel dibuat ulang di schema sementara, rollback sukses.`);
    else { console.error('❌ Verifikasi GAGAL:', v.error); await pool.end(); process.exit(1); }
  }

  await pool.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
