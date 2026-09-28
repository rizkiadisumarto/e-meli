/**
 * Supabase keep-alive — mencegah project Free di-pause (7 hari inactivity).
 *
 * Supabase menghitung "aktivitas database", jadi ping harus benar-benar
 * mengeksekusi query. Script ini menjalankan 2 jenis aktivitas:
 *   1. PostgREST  -> GET /rest/v1/<tabel>  (lewatan gateway Supabase)
 *   2. TCP langsung -> SELECT pada beberapa tabel (lewatan koneksi Postgres)
 *
 * Pakai lokal  : node server/keep-alive.js
 * Pakai di CI  : lihat .github/workflows/supabase-keepalive.yml
 *
 * Exit code 0 = database hidup & aktif, 1 = gagal (jadi job CI merah).
 */

const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const PING_TABLES = ['members', 'transactions', 'events'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const keyLooksReal = (k) => !!k && !/^\[/.test(k.trim()) && k.split('.').length === 3;

/** 1. Aktivitas lewat PostgREST (API gateway Supabase). */
async function pingRest() {
  if (!SUPABASE_URL || !keyLooksReal(ANON_KEY)) {
    console.log('⏭️  PostgREST dilewati (SUPABASE_URL / SUPABASE_ANON_KEY belum diisi di .env)');
    return null;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${PING_TABLES[0]}?select=id&limit=1`;
      const res = await fetch(url, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        signal: AbortSignal.timeout(30000),
      });
      const body = await res.text();
      if (res.ok) {
        console.log(`✅ PostgREST  : HTTP ${res.status} (query jalan, body: ${body.slice(0, 60)})`);
        return true;
      }
      // 401/403 = salah key, tidak akan membaik dengan retry
      if (res.status === 401 || res.status === 403) throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (err && err.fatal) {
        console.error(`❌ PostgREST  : ${err.message} — cek SUPABASE_ANON_KEY`);
        return false;
      }
      console.warn(`   PostgREST  : percobaan ${attempt}/3 gagal (${err.message})`);
      if (attempt < 3) await sleep(1000 * attempt);
      else return false;
    }
  }
  return false;
}

/** 2. Aktivitas lewat koneksi Postgres langsung (TCP). */
async function pingTcp() {
  if (!DATABASE_URL) {
    console.error('❌ TCP        : DATABASE_URL kosong di .env');
    return false;
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = [];
      for (const t of PING_TABLES) {
        const r = await pool.query(`SELECT count(*)::int AS n FROM ${t}`);
        out.push(`${t}=${r.rows[0].n}`);
      }
      const info = await pool.query('SELECT current_database() AS db, now() AS ts');
      console.log(`✅ TCP        : ${info.rows[0].db} @ ${info.rows[0].ts} | ${out.join(', ')}`);
      await pool.end();
      return true;
    } catch (err) {
      console.warn(`   TCP        : percobaan ${attempt}/3 gagal (${err.message})`);
      if (attempt < 3) await sleep(2000 * attempt);
      else {
        await pool.end().catch(() => {});
        console.error('❌ TCP        : koneksi langsung ke Supabase gagal');
        return false;
      }
    }
  }
  return false;
}

(async () => {
  console.log(`⏱️  keep-alive ${new Date().toISOString()} — ${SUPABASE_URL || '(URL belum diisi)'}`);
  const rest = await pingRest();
  const tcp = await pingTcp();

  // Minimal satu jalur harus berhasil supaya timer inactivity di-reset
  const ok = rest === true || tcp === true;
  console.log(ok ? '\n🟢 AMAN: aktivitas database terkirim, timer inactivity di-reset.' : '\n🔴 GAGAL: tidak ada query yang sampai ke database.');
  process.exit(ok ? 0 : 1);
})();
