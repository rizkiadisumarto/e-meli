const express = require('express');
const { queryAll, queryGet, queryRun } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/members
router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND (name LIKE ? OR address LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    query += ' ORDER BY name ASC';
    const members = queryAll(query, params);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/members/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const member = queryGet('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    
    // Get payment history
    const payments = queryAll(`
      SELECT dp.*, ds.amount as setting_amount 
      FROM dues_payments dp 
      LEFT JOIN dues_settings ds ON ds.id = (SELECT id FROM dues_settings ORDER BY effective_date DESC LIMIT 1)
      WHERE dp.member_id = ? 
      ORDER BY dp.year DESC, dp.month DESC
    `, [req.params.id]);
    
    res.json({ ...member, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/members
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, address, phone, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama harus diisi' });

    const result = queryRun(
      'INSERT INTO members (name, address, phone, status) VALUES (?, ?, ?, ?)',
      [name, address || '', phone || '', status || 'active']
    );

    const member = queryGet('SELECT * FROM members WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/members/:id
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, address, phone, status } = req.body;
    
    queryRun(
      'UPDATE members SET name=?, address=?, phone=?, status=? WHERE id=?',
      [name, address || '', phone || '', status || 'active', req.params.id]
    );

    const member = queryGet('SELECT * FROM members WHERE id = ?', [req.params.id]);
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/members/:id
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Remove participant records for this member
    queryRun('DELETE FROM event_participants WHERE member_id = ?', [req.params.id]);
    // Remove dues payments for this member
    queryRun('DELETE FROM dues_payments WHERE member_id = ?', [req.params.id]);
    // Delete the member
    queryRun('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Anggota berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
