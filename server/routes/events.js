const express = require('express');
const multer = require('multer');
const path = require('path');
const { queryAll, queryGet, queryRun } = require('../db/database');
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
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND (name LIKE ? OR location_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY start_date DESC';
    
    const events = queryAll(query, params);
    
    // Enrich with participant count & financial summary
    const enriched = events.map(event => {
      const participants = queryGet(`
        SELECT COUNT(*) as total, 
          SUM(CASE WHEN ep.attendance = 'present' THEN 1 ELSE 0 END) as present 
        FROM event_participants ep 
        INNER JOIN members m ON ep.member_id = m.id 
        WHERE ep.event_id = ?
      `, [event.id]);
      const income = queryGet('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = ? AND t.type = ?', [event.id, 'income']);
      const expense = queryGet('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = ? AND t.type = ?', [event.id, 'expense']);
      
      return {
        ...event,
        participant_count: participants.total,
        present_count: participants.present,
        total_income: income.total,
        total_expense: expense.total,
        balance: income.total - expense.total
      };
    });
    
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const event = queryGet('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
    
    // Financial summary
    const participants = queryGet(`
      SELECT COUNT(*) as total, 
        SUM(CASE WHEN ep.attendance = 'present' THEN 1 ELSE 0 END) as present 
      FROM event_participants ep 
      INNER JOIN members m ON ep.member_id = m.id 
      WHERE ep.event_id = ?
    `, [event.id]);
    const income = queryGet('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = ? AND t.type = ?', [event.id, 'income']);
    const expense = queryGet('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = ? AND t.type = ?', [event.id, 'expense']);
    const budgetTotal = queryGet('SELECT COALESCE(SUM(planned_amount),0) as planned, COALESCE(SUM(actual_amount),0) as actual FROM event_budget WHERE event_id = ?', [event.id]);
    
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
router.post('/', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person, notes, bank_info } = req.body;
    if (!name || !start_date) return res.status(400).json({ error: 'Nama dan tanggal mulai harus diisi' });

    const result = queryRun(
      'INSERT INTO events (name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person, notes, bank_info, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status || 'draft', target_per_person || 0, notes, bank_info ? JSON.stringify(bank_info) : null, req.user.id]
    );

    const event = queryGet('SELECT * FROM events WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person, notes, bank_info } = req.body;
    
    queryRun(
      'UPDATE events SET name=?, description=?, location_name=?, location_address=?, location_lat=?, location_lng=?, start_date=?, end_date=?, status=?, target_per_person=?, notes=?, bank_info=? WHERE id=?',
      [name, description, location_name, location_address, location_lat, location_lng, start_date, end_date, status, target_per_person || 0, notes, bank_info ? JSON.stringify(bank_info) : null, req.params.id]
    );

    const event = queryGet('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    queryRun('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PARTICIPANTS ====================

// GET /api/events/:id/participants
router.get('/:id/participants', authenticateToken, (req, res) => {
  try {
    const event = queryGet('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
    
    const participants = queryAll(`
      SELECT ep.*, m.name, m.address, m.phone 
      FROM event_participants ep 
      JOIN members m ON ep.member_id = m.id 
      WHERE ep.event_id = ? 
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
router.post('/:id/participants', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { member_ids } = req.body; // array of member IDs
    
    // Simulate transaction by running all inserts
    for (const memberId of member_ids) {
        try {
            queryRun('INSERT OR IGNORE INTO event_participants (event_id, member_id) VALUES (?, ?)', [req.params.id, memberId]);
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
router.put('/:id/participants/:participantId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { attendance, amount_paid, status } = req.body;
    
    queryRun('UPDATE event_participants SET attendance=?, amount_paid=?, status=? WHERE id=?', [attendance, amount_paid, status, req.params.participantId]);
    
    res.json({ message: 'Peserta berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/participants/:participantId
router.delete('/:id/participants/:participantId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    queryRun('DELETE FROM event_participants WHERE id = ?', [req.params.participantId]);
    res.json({ message: 'Peserta berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RUNDOWN ====================

// GET /api/events/:id/rundown
router.get('/:id/rundown', authenticateToken, (req, res) => {
  try {
    const items = queryAll('SELECT * FROM event_rundown WHERE event_id = ? ORDER BY sort_order, time', [req.params.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/rundown
router.post('/:id/rundown', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { time, activity, pic, notes, sort_order } = req.body;
    const result = queryRun(
      'INSERT INTO event_rundown (event_id, time, activity, pic, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, time, activity, pic, notes, sort_order || 0]
    );
    
    const item = queryGet('SELECT * FROM event_rundown WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/rundown/:itemId
router.put('/:id/rundown/:itemId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { time, activity, pic, notes, status, sort_order } = req.body;
    queryRun('UPDATE event_rundown SET time=?, activity=?, pic=?, notes=?, status=?, sort_order=? WHERE id=?',
      [time, activity, pic, notes, status, sort_order, req.params.itemId]);
    
    const item = queryGet('SELECT * FROM event_rundown WHERE id = ?', [req.params.itemId]);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/rundown/:itemId
router.delete('/:id/rundown/:itemId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    queryRun('DELETE FROM event_rundown WHERE id = ?', [req.params.itemId]);
    res.json({ message: 'Item rundown berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TASKS ====================

// GET /api/events/:id/tasks
router.get('/:id/tasks', authenticateToken, (req, res) => {
  try {
    const items = queryAll('SELECT * FROM event_tasks WHERE event_id = ? ORDER BY sort_order', [req.params.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/tasks
router.post('/:id/tasks', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { task, pic, sort_order } = req.body;
    const result = queryRun(
      'INSERT INTO event_tasks (event_id, task, pic, sort_order) VALUES (?, ?, ?, ?)',
      [req.params.id, task, pic, sort_order || 0]
    );
    
    const item = queryGet('SELECT * FROM event_tasks WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/tasks/:taskId
router.put('/:id/tasks/:taskId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { task, pic, status, sort_order } = req.body;
    queryRun('UPDATE event_tasks SET task=?, pic=?, status=?, sort_order=? WHERE id=?',
      [task, pic, status, sort_order, req.params.taskId]);
    
    const item = queryGet('SELECT * FROM event_tasks WHERE id = ?', [req.params.taskId]);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/tasks/:taskId
router.delete('/:id/tasks/:taskId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    queryRun('DELETE FROM event_tasks WHERE id = ?', [req.params.taskId]);
    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BUDGET (RAB) ====================

// GET /api/events/:id/budget
router.get('/:id/budget', authenticateToken, (req, res) => {
  try {
    const items = queryAll('SELECT * FROM event_budget WHERE event_id = ? ORDER BY sort_order', [req.params.id]);
    const totals = queryGet('SELECT COALESCE(SUM(planned_amount),0) as planned, COALESCE(SUM(actual_amount),0) as actual FROM event_budget WHERE event_id = ?', [req.params.id]);
    res.json({ items, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/budget
router.post('/:id/budget', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { item, qty, unit_price, actual_amount, sort_order } = req.body;
    const planned = (qty || 1) * (unit_price || 0);
    const result = queryRun(
      'INSERT INTO event_budget (event_id, item, qty, unit_price, planned_amount, actual_amount, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, item, qty || 1, unit_price || 0, planned, actual_amount || 0, sort_order || 0]
    );
    
    const budgetItem = queryGet('SELECT * FROM event_budget WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(budgetItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/budget/:budgetId
router.put('/:id/budget/:budgetId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { item, qty, unit_price, actual_amount, status, sort_order } = req.body;
    const planned = (qty || 1) * (unit_price || 0);
    const computedStatus = actual_amount > planned ? 'over' : (actual_amount > 0 ? 'done' : 'pending');
    
    queryRun('UPDATE event_budget SET item=?, qty=?, unit_price=?, planned_amount=?, actual_amount=?, status=?, sort_order=? WHERE id=?',
      [item, qty || 1, unit_price || 0, planned, actual_amount || 0, status || computedStatus, sort_order, req.params.budgetId]);
    
    const budgetItem = queryGet('SELECT * FROM event_budget WHERE id = ?', [req.params.budgetId]);
    res.json(budgetItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/budget/:budgetId
router.delete('/:id/budget/:budgetId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    queryRun('DELETE FROM event_budget WHERE id = ?', [req.params.budgetId]);
    res.json({ message: 'Item RAB berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EVENT TRANSACTIONS ====================

// GET /api/events/:id/transactions
router.get('/:id/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = queryAll(`
      SELECT t.*, c.name as category_name, m.name as member_name
      FROM event_transactions et
      JOIN transactions t ON et.transaction_id = t.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN members m ON t.member_id = m.id
      WHERE et.event_id = ?
      ORDER BY t.date DESC
    `, [req.params.id]);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/transactions - Create a transaction linked to event
router.post('/:id/transactions', authenticateToken, requireAdminOrCommittee, upload.single('proof_image'), (req, res) => {
  try {
    const { type, category_id, amount, description, date, member_id } = req.body;
    const proof_image = req.file ? `/uploads/${req.file.filename}` : null;

    // Create the transaction
    const txResult = queryRun(
      'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by, proof_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [type, category_id || null, amount, description, date, member_id || null, req.user.id, proof_image]
    );

    // Link to event
    queryRun('INSERT INTO event_transactions (event_id, transaction_id) VALUES (?, ?)', [req.params.id, txResult.lastInsertRowid]);
    
    // If this is a participant payment, update their amount_paid
    if (member_id && type === 'income') {
      const participant = queryGet('SELECT * FROM event_participants WHERE event_id = ? AND member_id = ?', [req.params.id, member_id]);
      if (participant) {
        const newPaid = participant.amount_paid + amount;
        const event = queryGet('SELECT target_per_person FROM events WHERE id = ?', [req.params.id]);
        const payStatus = newPaid >= event.target_per_person ? 'paid' : 'partial';
        queryRun('UPDATE event_participants SET amount_paid = ?, status = ? WHERE id = ?', [newPaid, payStatus, participant.id]);
      }
    }

    const transaction = queryGet('SELECT * FROM transactions WHERE id = ?', [txResult.lastInsertRowid]);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id/transactions/:txId - Edit event transaction
router.put('/:id/transactions/:txId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    const { type, category_id, amount, description, date, member_id } = req.body;

    // Check if transaction belongs to this event
    const eventTx = queryGet('SELECT * FROM event_transactions WHERE event_id = ? AND transaction_id = ?', [req.params.id, req.params.txId]);
    if (!eventTx) return res.status(404).json({ error: 'Transaksi tidak ditemukan di event ini' });

    queryRun(
      'UPDATE transactions SET type = ?, category_id = ?, amount = ?, description = ?, date = ?, member_id = ? WHERE id = ?',
      [type, category_id || null, amount, description || '', date, member_id || null, req.params.txId]
    );

    const transaction = queryGet('SELECT * FROM transactions WHERE id = ?', [req.params.txId]);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id/transactions/:txId - Delete event transaction
router.delete('/:id/transactions/:txId', authenticateToken, requireAdminOrCommittee, (req, res) => {
  try {
    // Check if transaction belongs to this event
    const eventTx = queryGet('SELECT * FROM event_transactions WHERE event_id = ? AND transaction_id = ?', [req.params.id, req.params.txId]);
    if (!eventTx) return res.status(404).json({ error: 'Transaksi tidak ditemukan di event ini' });

    // Delete event_transactions link first
    queryRun('DELETE FROM event_transactions WHERE transaction_id = ?', [req.params.txId]);
    // Delete the transaction
    queryRun('DELETE FROM transactions WHERE id = ?', [req.params.txId]);

    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id/summary - Financial summary for event
router.get('/:id/summary', authenticateToken, (req, res) => {
  try {
    const event = queryGet('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
    
    const participants = queryGet(`
      SELECT COUNT(*) as total, 
        SUM(CASE WHEN ep.attendance = 'present' THEN 1 ELSE 0 END) as present,
        SUM(ep.amount_paid) as total_paid
      FROM event_participants ep 
      INNER JOIN members m ON ep.member_id = m.id 
      WHERE ep.event_id = ?
    `, [req.params.id]);
    
    const income = queryGet('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = ? AND t.type = ?', [req.params.id, 'income']);
    const expense = queryGet('SELECT COALESCE(SUM(t.amount),0) as total FROM event_transactions et JOIN transactions t ON et.transaction_id = t.id WHERE et.event_id = ? AND t.type = ?', [req.params.id, 'expense']);
    const budget = queryGet('SELECT COALESCE(SUM(planned_amount),0) as planned, COALESCE(SUM(actual_amount),0) as actual FROM event_budget WHERE event_id = ?', [req.params.id]);
    
    // Expense breakdown by budget item
    const budgetItems = queryAll('SELECT item, actual_amount FROM event_budget WHERE event_id = ? AND actual_amount > 0 ORDER BY actual_amount DESC', [req.params.id]);
    
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
