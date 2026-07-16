const express = require('express');
const { queryAllAsync, queryGetAsync, queryRunAsync } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await queryAllAsync('SELECT * FROM settings');
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
        try {
            await queryRunAsync('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value]);
        } catch(e) {
            console.error('Error updating setting', key, e);
        }
    }
    
    res.json({ message: 'Pengaturan berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await queryAllAsync('SELECT * FROM categories ORDER BY type, name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/categories
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Nama dan tipe harus diisi' });
    
    const result = await queryRunAsync('INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id', [name, type]);
    const category = await queryGetAsync('SELECT * FROM categories WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/categories/:id
router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Nama dan tipe harus diisi' });

    await queryRunAsync('UPDATE categories SET name = $1, type = $2 WHERE id = $3', [name, type, req.params.id]);
    const category = await queryGetAsync('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/categories/:id
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await queryAllAsync('SELECT id, username, full_name, role, phone, created_at FROM users ORDER BY created_at');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/users/:id
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { full_name, role, password, phone } = req.body;
    if (!full_name || !role) return res.status(400).json({ error: 'Nama lengkap dan role harus diisi' });

    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(password, 10);
      await queryRunAsync('UPDATE users SET full_name = $1, role = $2, password = $3, phone = $4 WHERE id = $5', [full_name, role, hashedPassword, phone || null, req.params.id]);
    } else {
      await queryRunAsync('UPDATE users SET full_name = $1, role = $2, phone = $3 WHERE id = $4', [full_name, role, phone || null, req.params.id]);
    }

    const user = await queryGetAsync('SELECT id, username, full_name, role, phone, created_at FROM users WHERE id = $1', [req.params.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/users/:id
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
    }
    await queryRunAsync('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
