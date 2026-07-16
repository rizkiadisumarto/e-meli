const express = require('express');
const { queryAllAsync, queryGetAsync, queryRunAsync } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/members
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status) { query += ` AND status = $${paramIdx++}`; params.push(status); }
    if (search) { query += ` AND (name LIKE $${paramIdx} OR address LIKE $${paramIdx + 1} OR phone LIKE $${paramIdx + 2})`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    query += ' ORDER BY name ASC';
    const members = await queryAllAsync(query, params);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/members/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const member = await queryGetAsync('SELECT * FROM members WHERE id = $1', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    
    // Get payment history
    const payments = await queryAllAsync(`
      SELECT dp.*, ds.amount as setting_amount 
      FROM dues_payments dp 
      LEFT JOIN dues_settings ds ON ds.id = (SELECT id FROM dues_settings ORDER BY effective_date DESC LIMIT 1)
      WHERE dp.member_id = $1 
      ORDER BY dp.year DESC, dp.month DESC
    `, [req.params.id]);
    
    res.json({ ...member, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/members
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, phone, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama harus diisi' });

    const result = await queryRunAsync(
      'INSERT INTO members (name, address, phone, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, address || '', phone || '', status || 'active']
    );

    const member = await queryGetAsync('SELECT * FROM members WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/members/:id
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, phone, status } = req.body;
    
    await queryRunAsync(
      'UPDATE members SET name=$1, address=$2, phone=$3, status=$4 WHERE id=$5',
      [name, address || '', phone || '', status || 'active', req.params.id]
    );

    const member = await queryGetAsync('SELECT * FROM members WHERE id = $1', [req.params.id]);
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/members/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Remove participant records for this member
    await queryRunAsync('DELETE FROM event_participants WHERE member_id = $1', [req.params.id]);
    // Remove dues payments for this member
    await queryRunAsync('DELETE FROM dues_payments WHERE member_id = $1', [req.params.id]);
    // Delete the member
    await queryRunAsync('DELETE FROM members WHERE id = $1', [req.params.id]);
    res.json({ message: 'Anggota berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
