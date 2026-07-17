const express = require('express');
const multer = require('multer');
const path = require('path');
const { queryAllAsync, queryGetAsync, queryRunAsync } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer config for proof image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

// GET /api/transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, category_id, start_date, end_date, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT t.*, c.name as category_name, m.name as member_name, u.full_name as created_by_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN members m ON t.member_id = m.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id NOT IN (SELECT transaction_id FROM event_transactions WHERE transaction_id IS NOT NULL)
    `;
    const params = [];
    let paramIdx = 1;

    if (type) { query += ` AND t.type = $${paramIdx++}`; params.push(type); }
    if (category_id) { query += ` AND t.category_id = $${paramIdx++}`; params.push(category_id); }
    if (start_date) { query += ` AND t.date >= $${paramIdx++}`; params.push(start_date); }
    if (end_date) { query += ` AND t.date <= $${paramIdx++}`; params.push(end_date); }
    if (search) { query += ` AND (t.description LIKE $${paramIdx} OR m.name LIKE $${paramIdx + 1})`; params.push(`%${search}%`, `%${search}%`); paramIdx += 2; }

    query += ` ORDER BY t.date DESC, t.id DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(Number(limit), Number(offset));

    const transactions = await queryAllAsync(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM transactions t LEFT JOIN members m ON t.member_id = m.id WHERE t.id NOT IN (SELECT transaction_id FROM event_transactions WHERE transaction_id IS NOT NULL)`;
    const countParams = [];
    let cParamIdx = 1;
    if (type) { countQuery += ` AND t.type = $${cParamIdx++}`; countParams.push(type); }
    if (category_id) { countQuery += ` AND t.category_id = $${cParamIdx++}`; countParams.push(category_id); }
    if (start_date) { countQuery += ` AND t.date >= $${cParamIdx++}`; countParams.push(start_date); }
    if (end_date) { countQuery += ` AND t.date <= $${cParamIdx++}`; countParams.push(end_date); }
    if (search) { countQuery += ` AND (t.description LIKE $${cParamIdx} OR m.name LIKE $${cParamIdx + 1})`; countParams.push(`%${search}%`, `%${search}%`); }
    
    const countResult = await queryGetAsync(countQuery, countParams);

    res.json({ transactions, total: countResult ? countResult.total : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await queryGetAsync(`
      SELECT t.*, c.name as category_name, m.name as member_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN members m ON t.member_id = m.id
      WHERE t.id = $1
    `, [req.params.id]);
    
    if (!transaction) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', authenticateToken, requireAdmin, upload.single('proof_image'), async (req, res) => {
  try {
    const { type, category_id, amount, description, date, member_id } = req.body;
    const proof_image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!type || !amount || !date) {
      return res.status(400).json({ error: 'Type, amount, dan date harus diisi' });
    }

    const result = await queryRunAsync(
      'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by, proof_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [type, category_id || null, amount, description || '', date, member_id || null, req.user.id, proof_image]
    );

    const transaction = await queryGetAsync('SELECT * FROM transactions WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', authenticateToken, requireAdmin, upload.single('proof_image'), async (req, res) => {
  try {
    const { type, category_id, amount, description, date, member_id } = req.body;
    const proof_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (proof_image !== undefined) {
      await queryRunAsync(
        'UPDATE transactions SET type=$1, category_id=$2, amount=$3, description=$4, date=$5, member_id=$6, proof_image=$7 WHERE id=$8',
        [type, category_id || null, amount, description || '', date, member_id || null, proof_image, req.params.id]
      );
    } else {
      await queryRunAsync(
        'UPDATE transactions SET type=$1, category_id=$2, amount=$3, description=$4, date=$5, member_id=$6 WHERE id=$7',
        [type, category_id || null, amount, description || '', date, member_id || null, req.params.id]
      );
    }

    const transaction = await queryGetAsync('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions/import - Import transactions from Excel/JSON
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Data transaksi tidak valid' });
    }

    let imported = 0;
    let skipped = 0;
    for (const tx of transactions) {
      try {
        const type = (tx.Tipe || tx.type || '').toLowerCase().trim();
        if (type !== 'income' && type !== 'expense') { skipped++; continue; }

        const amount = parseFloat(String(tx.Nominal || tx.amount || '0').replace(/[^\d.-]/g, ''));
        if (!amount || amount <= 0) { skipped++; continue; }

        const date = tx.Tanggal || tx.date || new Date().toISOString().split('T')[0];
        const description = tx.Keterangan || tx.description || '';

        // Try to match category by name
        let categoryId = null;
        const catName = tx.Kategori || tx.category_name || '';
        if (catName) {
          const cat = await queryGetAsync('SELECT id FROM categories WHERE name = $1', [catName]);
          if (cat) categoryId = cat.id;
        }

        // Try to match member by name
        let memberId = null;
        const memberName = tx['Dari / Kepada'] || tx.member_name || '';
        if (memberName) {
          const member = await queryGetAsync('SELECT id FROM members WHERE name = $1', [memberName]);
          if (member) memberId = member.id;
        }

        await queryRunAsync(
          'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [type, categoryId, amount, description, date, memberId || null, req.user.id]
        );
        imported++;
      } catch (e) {
        skipped++;
      }
    }
    res.json({ message: `Import selesai: ${imported} transaksi berhasil, ${skipped} dilewati`, imported, skipped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/categories/all
router.get('/categories/all', authenticateToken, async (req, res) => {
  try {
    const categories = await queryAllAsync('SELECT * FROM categories ORDER BY type, name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
