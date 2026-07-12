const express = require('express');
const { queryAll, queryGet, queryRun } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/summary
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    if (start_date) { dateFilter += ' AND date >= ?'; params.push(start_date); }
    if (end_date) { dateFilter += ' AND date <= ?'; params.push(end_date); }

    const income = queryGet(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type = 'income'${dateFilter}`, params);
    const expense = queryGet(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type = 'expense'${dateFilter}`, params);
    const totalMembers = queryGet('SELECT COUNT(*) as total FROM members WHERE status = ?', ['active']);
    const totalTransactions = queryGet(`SELECT COUNT(*) as total FROM transactions WHERE 1=1${dateFilter}`, params);

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
router.get('/monthly', authenticateToken, (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    const monthly = queryAll(`
      SELECT 
        CAST(strftime('%m', date) AS INTEGER) as month,
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE strftime('%Y', date) = ?
      GROUP BY month, type
      ORDER BY month
    `, [String(targetYear)]);

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
router.get('/by-category', authenticateToken, (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    
    let query = `
      SELECT c.name, c.type, SUM(t.amount) as total 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    if (type) { query += ' AND t.type = ?'; params.push(type); }
    if (start_date) { query += ' AND t.date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND t.date <= ?'; params.push(end_date); }
    query += ' GROUP BY c.id ORDER BY total DESC';

    const categories = queryAll(query, params);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/recent-transactions
router.get('/recent-transactions', authenticateToken, (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const transactions = queryAll(`
      SELECT t.*, c.name as category_name, m.name as member_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN members m ON t.member_id = m.id
      ORDER BY t.date DESC, t.id DESC
      LIMIT ?
    `, [Number(limit)]);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/dues-summary
router.get('/dues-summary', authenticateToken, (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const totalActive = queryGet('SELECT COUNT(*) as total FROM members WHERE status = ?', ['active']);
    const paid = queryGet('SELECT COUNT(*) as total FROM dues_payments WHERE month = ? AND year = ? AND status = ?', [currentMonth, currentYear, 'paid']);
    const paidAmount = queryGet('SELECT COALESCE(SUM(amount), 0) as total FROM dues_payments WHERE month = ? AND year = ? AND status = ?', [currentMonth, currentYear, 'paid']);
    const duesSettings = queryGet('SELECT amount FROM dues_settings ORDER BY effective_date DESC LIMIT 1');
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
