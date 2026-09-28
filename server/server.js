require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { initializeDb, getDb } = require('./db/database');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const memberRoutes = require('./routes/members');
const duesRoutes = require('./routes/dues');
const eventRoutes = require('./routes/events');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Health check — dipakai Render, monitoring, dan ping keep-alive.
// Wajib membangunkan database supaya request ini benar-benar berarti.
app.get('/api/health', async (req, res) => {
  const started = Date.now();
  try {
    const pool = getDb();
    if (!pool) throw new Error('database belum terhubung');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up', uptime: Math.round(process.uptime()), ms: Date.now() - started });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'down', error: err.message });
  }
});

// Endpoint /api yang tidak dikenal harus 404, BUKAN menggantung tanpa respons
// (sebelumnya request seperti /api/health tidak pernah dijawab sama sekali).
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// Serve static files from client build (production)
// Aset ber-hash di-cache 1 tahun, tapi index.html TIDAK — kalau tidak,
// user akan terus mendapat shell lama setelah deploy baru (blank page).
const DIST = path.join(__dirname, '../client/dist');
app.use(express.static(DIST, {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

// SPA fallback — selalu no-cache supaya selalu versi terbaru (ETag bikin 304, tetap cepat)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(path.join(DIST, 'index.html'));
  }
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

// Initialize database then start server
initializeDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT}`);
      console.log(`📊 API tersedia di http://localhost:${PORT}/api`);
    });
}).catch(err => {
    console.error('❌ Failed to start server:', err.message);
    console.error('   → Cek variabel env DATABASE_URL di Render (host, user, password).');
    process.exit(1);
});
