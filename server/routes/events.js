const express = require('express');
const multer = require('multer');
const path = require('path');
const { queryAllAsync, queryGetAsync, queryRunAsync } = require('../db/database');
const { authenticateToken, requireAdminOrCommittee } = require('../middleware/auth');

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

// ==================== EVENT CRUD ====================

// GET /api/events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    let paramIdx = 1;
    if (status) { query += ` AND status = $${paramIdx++}`; params.push(status); }
    if (search) { query += ` AND (name LIKE $${paramIdx} OR location_name LIKE $${paramIdx + 1})`; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY start_date DESC';
    
    const events = await queryAllAsync(query, params);
    
    // Enrich with participant count & financial summary
    const enriched = [];
    for (const event of events) {
      const participants = await queryGetAsync(`
        SELECT COUNT(*) as total, 
          SUM(CASE WHEN ep.attendance = 'present' THEN 1 ELSE 0 END) as present 
        FROM event_participants ep 
        INNER JOIN members m ON ep.member_id = m.id 
        WHERE ep.event_id = $1
      `, [event.id]);
      const income = await queryGetAsync('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = $1 AND t.type = $2', [event.id, 'income']);
      const expense = await queryGetAsync('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = $1 AND t.type = $2', [event.id, 'expense']);
      
      enriched.push({
        ...event,
        participant_count: participants.total,
        present_count: participants.present,
        total_income: income.total,
        total_expense: expense.total,
        balance: income.total - expense.total
      });
    }
    
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await queryGetAsync('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
    
    // Financial summary
    const participants = await queryGetAsync(`
      SELECT COUNT(*) as total, 
        SUM(CASE WHEN ep.attendance = 'present' THEN 1 ELSE 0 END) as present 
      FROM event_participants ep 
      INNER JOIN members m ON ep.member_id = m.id 
      WHERE ep.event_id = $1
    `, [event.id]);
    const income = await queryGetAsync('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = $1 AND t.type = $2', [event.id, 'income']);
    const expense = await queryGetAsync('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = $1 AND t.type = $2', [event.id, 'expense']);
    const budgetTotal = await queryGetAsync('SELECT COALESCE(SUM(planned_amount),0) as planned, COALESCE(SUM(actual_amount),0) as actual FROM event_budget WHERE event_id = $1', [event.id]);
    
    res.json({
      ...event,
      bank_info: event.bank_info ? JSON.parse(event.bank_info) : null,
      participant_count: participants.total,
      present_count: participants.present,
      total_income: income.total,
      total_expense: expense.total,
      balance: income.total - expense.total,
      potential_income: event.target_per_person * participants.total,
      planned_budget: budgetTotal.planned,
      actual_budget: budgetTotal.actual
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person, notes, bank_info } = req.body;
    if (!name || !start_date) return res.status(400).json({ error: 'Nama dan tanggal mulai harus diisi' });

    const result = await queryRunAsync(
      'INSERT INTO events (name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person, notes, bank_info, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id',
      [name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status || 'draft', target_per_person || 0, notes, bank_info ? JSON.stringify(bank_info) : null, req.user.id]
    );

    const event = await queryGetAsync('SELECT * FROM events WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person, notes, bank_info } = req.body;
    
    await queryRunAsync(
      'UPDATE events SET name=$1, description=$2, location_name=$3, location_address=$4, location_lat=$5, location_lng=$6, start_date=$7, end_date=$8, status=$9, target_per_person=$10, notes=$11, bank_info=$12 WHERE id=$13',
      [name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person || 0, notes, bank_info ? JSON.stringify(bank_info) : null, req.params.id]
    );

    const event = await queryGetAsync('SELECT * FROM events WHERE id = $1', [req.params.id]);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PARTICIPANTS ====================

// GET /api/events/:id/participants
router.get('/:id/participants', authenticateToken, async (req, res) => {
  try {
    const event = await queryGetAsync('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
    
    const participants = await queryAllAsync(`
      SELECT ep.*, m.name, m.address, m.phone 
      FROM event_participants ep 
      JOIN members m ON ep.member_id = m.id 
      WHERE ep.event_id = $1 
      ORDER BY m.name
    `, [req.params.id]);
    
    res.json(participants.map(p => ({
      ...p,
      target: event.target_per_person
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/participants
router.post('/:id/participants', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { member_ids } = req.body; // array of member IDs
    
    // Simulate transaction by running all inserts
    for (const memberId of member_ids) {
        try {
            await queryRunAsync('INSERT INTO event_participants (event_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.id, memberId]);
        } catch(e) {
            console.error('Error adding participant', memberId, e);
        }
    }
    
    res.status(201).json({ message: 'Peserta berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/participants/:participantId
router.put('/:id/participants/:participantId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { attendance, amount_paid, status } = req.body;
    
    await queryRunAsync('UPDATE event_participants SET attendance=$1, amount_paid=$2, status=$3 WHERE id=$4', [attendance, amount_paid, status, req.params.participantId]);
    
    res.json({ message: 'Peserta berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/participants/:participantId
router.delete('/:id/participants/:participantId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM event_participants WHERE id = $1', [req.params.participantId]);
    res.json({ message: 'Peserta berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RUNDOWN ====================

// GET /api/events/:id/rundown
router.get('/:id/rundown', authenticateToken, async (req, res) => {
  try {
    const items = await queryAllAsync('SELECT * FROM event_rundown WHERE event_id = $1 ORDER BY sort_order, time', [req.params.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/rundown
router.post('/:id/rundown', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { time, activity, pic, notes, sort_order } = req.body;
    const result = await queryRunAsync(
      'INSERT INTO event_rundown (event_id, time, activity, pic, notes, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.params.id, time, activity, pic, notes, sort_order || 0]
    );
    
    const item = await queryGetAsync('SELECT * FROM event_rundown WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/rundown/:itemId
router.put('/:id/rundown/:itemId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { time, activity, pic, notes, status, sort_order } = req.body;
    await queryRunAsync('UPDATE event_rundown SET time=$1, activity=$2, pic=$3, notes=$4, status=$5, sort_order=$6 WHERE id=$7',
      [time, activity, pic, notes, status, sort_order, req.params.itemId]);
    
    const item = await queryGetAsync('SELECT * FROM event_rundown WHERE id = $1', [req.params.itemId]);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/rundown/:itemId
router.delete('/:id/rundown/:itemId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM event_rundown WHERE id = $1', [req.params.itemId]);
    res.json({ message: 'Item rundown berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TASKS ====================

// GET /api/events/:id/tasks
router.get('/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const items = await queryAllAsync('SELECT * FROM event_tasks WHERE event_id = $1 ORDER BY sort_order', [req.params.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/tasks
router.post('/:id/tasks', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { task, pic, sort_order } = req.body;
    const result = await queryRunAsync(
      'INSERT INTO event_tasks (event_id, task, pic, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.params.id, task, pic, sort_order || 0]
    );
    
    const item = await queryGetAsync('SELECT * FROM event_tasks WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/tasks/:taskId
router.put('/:id/tasks/:taskId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { task, pic, status, sort_order } = req.body;
    await queryRunAsync('UPDATE event_tasks SET task=$1, pic=$2, status=$3, sort_order=$4 WHERE id=$5',
      [task, pic, status, sort_order, req.params.taskId]);
    
    const item = await queryGetAsync('SELECT * FROM event_tasks WHERE id = $1', [req.params.taskId]);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/tasks/:taskId
router.delete('/:id/tasks/:taskId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM event_tasks WHERE id = $1', [req.params.taskId]);
    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BUDGET (RAB) ====================

// GET /api/events/:id/budget
router.get('/:id/budget', authenticateToken, async (req, res) => {
  try {
    const items = await queryAllAsync('SELECT * FROM event_budget WHERE event_id = $1 ORDER BY sort_order', [req.params.id]);
    const totals = await queryGetAsync('SELECT COALESCE(SUM(planned_amount),0) as planned, COALESCE(SUM(actual_amount),0) as actual FROM event_budget WHERE event_id = $1', [req.params.id]);
    res.json({ items, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/budget
router.post('/:id/budget', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { item, qty, unit_price, actual_amount, sort_order } = req.body;
    const planned = (qty || 1) * (unit_price || 0);
    const result = await queryRunAsync(
      'INSERT INTO event_budget (event_id, item, qty, unit_price, planned_amount, actual_amount, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [req.params.id, item, qty || 1, unit_price || 0, planned, actual_amount || 0, sort_order || 0]
    );
    
    const budgetItem = await queryGetAsync('SELECT * FROM event_budget WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(budgetItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/budget/:budgetId
router.put('/:id/budget/:budgetId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { item, qty, unit_price, actual_amount, status, sort_order } = req.body;
    const planned = (qty || 1) * (unit_price || 0);
    const computedStatus = actual_amount > planned ? 'over' : (actual_amount > 0 ? 'done' : 'pending');
    
    await queryRunAsync('UPDATE event_budget SET item=$1, qty=$2, unit_price=$3, planned_amount=$4, actual_amount=$5, status=$6, sort_order=$7 WHERE id=$8',
      [item, qty || 1, unit_price || 0, planned, actual_amount || 0, status || computedStatus, sort_order, req.params.budgetId]);
    
    const budgetItem = await queryGetAsync('SELECT * FROM event_budget WHERE id = $1', [req.params.budgetId]);
    res.json(budgetItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/budget/:budgetId
router.delete('/:id/budget/:budgetId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    await queryRunAsync('DELETE FROM event_budget WHERE id = $1', [req.params.budgetId]);
    res.json({ message: 'Item RAB berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EVENT TRANSACTIONS ====================

// GET /api/events/:id/transactions
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await queryAllAsync(`
      SELECT t.*, c.name as category_name, m.name as member_name
      FROM event_transactions et
      JOIN transactions t ON et.transaction_id = t.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN members m ON t.member_id = m.id
      WHERE et.event_id = $1
      ORDER BY t.date DESC
    `, [req.params.id]);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/transactions - Create a transaction linked to event
router.post('/:id/transactions', authenticateToken, requireAdminOrCommittee, upload.single('proof_image'), async (req, res) => {
  try {
    const { type, category_id, amount, description, date, member_id } = req.body;
    const proof_image = req.file ? `/uploads/${req.file.filename}` : null;

    // Create the transaction
    const txResult = await queryRunAsync(
      'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by, proof_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [type, category_id || null, amount, description, date, member_id || null, req.user.id, proof_image]
    );

    // Link to event
    await queryRunAsync('INSERT INTO event_transactions (event_id, transaction_id) VALUES ($1, $2)', [req.params.id, txResult.lastInsertRowid]);
    
    // If this is a participant payment, update their amount_paid
    if (member_id && type === 'income') {
      const participant = await queryGetAsync('SELECT * FROM event_participants WHERE event_id = $1 AND member_id = $2', [req.params.id, member_id]);
      if (participant) {
        const newPaid = participant.amount_paid + amount;
        const event = await queryGetAsync('SELECT target_per_person FROM events WHERE id = $1', [req.params.id]);
        const payStatus = newPaid >= event.target_per_person ? 'paid' : 'partial';
        await queryRunAsync('UPDATE event_participants SET amount_paid = $1, status = $2 WHERE id = $3', [newPaid, payStatus, participant.id]);
      }
    }

    const transaction = await queryGetAsync('SELECT * FROM transactions WHERE id = $1', [txResult.lastInsertRowid]);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/transactions/:txId - Edit event transaction
router.put('/:id/transactions/:txId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    const { type, category_id, amount, description, date, member_id } = req.body;

    // Check if transaction belongs to this event
    const eventTx = await queryGetAsync('SELECT * FROM event_transactions WHERE event_id = $1 AND transaction_id = $2', [req.params.id, req.params.txId]);
    if (!eventTx) return res.status(404).json({ error: 'Transaksi tidak ditemukan di event ini' });

    await queryRunAsync(
      'UPDATE transactions SET type = $1, category_id = $2, amount = $3, description = $4, date = $5, member_id = $6 WHERE id = $7',
      [type, category_id || null, amount, description || '', date, member_id || null, req.params.txId]
    );

    const transaction = await queryGetAsync('SELECT * FROM transactions WHERE id = $1', [req.params.txId]);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/transactions/:txId - Delete event transaction
router.delete('/:id/transactions/:txId', authenticateToken, requireAdminOrCommittee, async (req, res) => {
  try {
    // Check if transaction belongs to this event
    const eventTx = await queryGetAsync('SELECT * FROM event_transactions WHERE event_id = $1 AND transaction_id = $2', [req.params.id, req.params.txId]);
    if (!eventTx) return res.status(404).json({ error: 'Transaksi tidak ditemukan di event ini' });

    // Delete event_transactions link first
    await queryRunAsync('DELETE FROM event_transactions WHERE transaction_id = $1', [req.params.txId]);
    // Delete the transaction
    await queryRunAsync('DELETE FROM transactions WHERE id = $1', [req.params.txId]);

    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id/summary - Financial summary for event
router.get('/:id/summary', authenticateToken, async (req, res) => {
  try {
    const event = await queryGetAsync('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
    
    const participants = await queryGetAsync(`
      SELECT COUNT(*) as total, 
        SUM(CASE WHEN ep.attendance = 'present' THEN 1 ELSE 0 END) as present,
        SUM(ep.amount_paid) as total_paid
      FROM event_participants ep 
      INNER JOIN members m ON ep.member_id = m.id 
      WHERE ep.event_id = $1
    `, [req.params.id]);
    
    const income = await queryGetAsync('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = $1 AND t.type = $2', [req.params.id, 'income']);
    const expense = await queryGetAsync('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = $1 AND t.type = $2', [req.params.id, 'expense']);
    const budget = await queryGetAsync('SELECT COALESCE(SUM(planned_amount),0) as planned, COALESCE(SUM(actual_amount),0) as actual FROM event_budget WHERE event_id = $1', [req.params.id]);
    
    // Expense breakdown by budget item
    const budgetItems = await queryAllAsync('SELECT item, actual_amount FROM event_budget WHERE event_id = $1 AND actual_amount > 0 ORDER BY actual_amount DESC', [req.params.id]);
    
    res.json({
      attendance: { total: participants.total, present: participants.present },
      income: income.total,
      expense: expense.total,
      balance: income.total - expense.total,
      potential_income: event.target_per_person * participants.total,
      planned_budget: budget.planned,
      actual_budget: budget.actual,
      projection: (event.target_per_person * participants.total) - budget.planned,
      expense_breakdown: budgetItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
