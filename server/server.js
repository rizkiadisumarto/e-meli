require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDb } = require('./db/database');

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
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files from client build (production)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
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
    console.error('Failed to start server:', err);
});
