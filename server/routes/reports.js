const express = require('express');
const { queryAllAsync, queryGetAsync, queryRunAsync } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    let paramIdx = 1;
    if (start_date) { dateFilter += ` AND date >= $${paramIdx++}`; params.push(start_date); }
    if (end_date) { dateFilter += ` AND date <= $${paramIdx++}`; params.push(end_date); }

    // Exclude transactions linked to events (event transactions are separate from general cash)
    const excludeEventTx = ' AND id NOT IN (SELECT transaction_id FROM event_transactions WHERE transaction_id IS NOT NULL)';

    const income = await queryGetAsync(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type = 'income'${excludeEventTx}${dateFilter}`, params);
    const expense = await queryGetAsync(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type = 'expense'${excludeEventTx}${dateFilter}`, params);
    const totalMembers = await queryGetAsync('SELECT COUNT(*) as total FROM members WHERE status = $1', ['active']);
    const totalTransactions = await queryGetAsync(`SELECT COUNT(*) as total FROM transactions WHERE 1=1${excludeEventTx}${dateFilter}`, params);

    res.json({
      total_income: income.total,
      total_expense: expense.total,
      balance: income.total - expense.total,
      total_members: totalMembers.total,
      total_transactions: totalTransactions.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/monthly
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    const monthly = await queryAllAsync(`
      SELECT
        EXTRACT(MONTH FROM date)::INTEGER as month,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
        AND id NOT IN (SELECT transaction_id FROM event_transactions WHERE transaction_id IS NOT NULL)
      GROUP BY month, type
      ORDER BY month
    `, [Number(targetYear)]);

    // Build 12-month array
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const inc = monthly.find(r => r.month === m && r.type === 'income');
      const exp = monthly.find(r => r.month === m && r.type === 'expense');
      result.push({
        month: m,
        income: inc ? inc.total : 0,
        expense: exp ? exp.total : 0
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/by-category
router.get('/by-category', authenticateToken, async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    
    let query = `
      SELECT c.name, c.type, SUM(t.amount) as total 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.id NOT IN (SELECT transaction_id FROM event_transactions WHERE transaction_id IS NOT NULL)
    `;
    const params = [];
    let paramIdx = 1;
    if (type) { query += ` AND t.type = $${paramIdx++}`; params.push(type); }
    if (start_date) { query += ` AND t.date >= $${paramIdx++}`; params.push(start_date); }
    if (end_date) { query += ` AND t.date <= $${paramIdx++}`; params.push(end_date); }
    query += ' GROUP BY c.id ORDER BY total DESC';

    const categories = await queryAllAsync(query, params);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/recent-transactions
router.get('/recent-transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const transactions = await queryAllAsync(`
      SELECT t.*, c.name as category_name, m.name as member_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN members m ON t.member_id = m.id
      WHERE t.id NOT IN (SELECT transaction_id FROM event_transactions WHERE transaction_id IS NOT NULL)
      ORDER BY t.date DESC, t.id DESC
      LIMIT $1
    `, [Number(limit)]);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/dues-summary
router.get('/dues-summary', authenticateToken, async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const totalActive = await queryGetAsync('SELECT COUNT(*) as total FROM members WHERE status = $1', ['active']);
    const paid = await queryGetAsync('SELECT COUNT(*) as total FROM dues_payments WHERE month = $1 AND year = $2 AND status = $3', [currentMonth, currentYear, 'paid']);
    const paidAmount = await queryGetAsync('SELECT COALESCE(SUM(amount), 0) as total FROM dues_payments WHERE month = $1 AND year = $2 AND status = $3', [currentMonth, currentYear, 'paid']);
    const duesSettings = await queryGetAsync('SELECT amount FROM dues_settings ORDER BY effective_date DESC LIMIT 1');
    const amountPerPerson = duesSettings ? duesSettings.amount : 0;

    const totalMembers = totalActive.total || 0;
    const paidCount = paid.total || 0;
    const unpaidCount = Math.max(0, totalMembers - paidCount);

    res.json({
      total_members: totalMembers,
      paid: paidCount,
      unpaid: unpaidCount,
      paid_amount: paidAmount.total || 0,
      amount_per_person: amountPerPerson,
      potential_total: totalMembers * amountPerPerson,
      month: currentMonth,
      year: currentYear
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
