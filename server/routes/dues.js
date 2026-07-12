const express = require('express');
const { queryAll, queryGet, queryRun } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/dues/settings
router.get('/settings', authenticateToken, (req, res) => {
  try {
    const settings = queryGet('SELECT * FROM dues_settings ORDER BY effective_date DESC LIMIT 1');
    res.json(settings || { amount: 0, period: 'monthly' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dues/settings
router.post('/settings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { amount, effective_date } = req.body;
    if (!amount || !effective_date) {
      return res.status(400).json({ error: 'Nominal dan tanggal efektif harus diisi' });
    }

    const result = queryRun(
      'INSERT INTO dues_settings (amount, period, effective_date) VALUES (?, ?, ?)',
      [amount, 'monthly', effective_date]
    );

    const setting = queryGet('SELECT * FROM dues_settings WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dues/payments?month=&year=
router.get('/payments', authenticateToken, (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    // Get all active members with their payment status for this month
    const members = queryAll('SELECT * FROM members WHERE status = ? ORDER BY name', ['active']);
    const settings = queryGet('SELECT * FROM dues_settings ORDER BY effective_date DESC LIMIT 1');
    const duesAmount = settings ? settings.amount : 0;

    const result = members.map(member => {
      const payment = queryGet(
        'SELECT * FROM dues_payments WHERE member_id = ? AND month = ? AND year = ?',
        [member.id, currentMonth, currentYear]
      );

      return {
        member_id: member.id,
        member_name: member.name,
        member_address: member.address,
        month: Number(currentMonth),
        year: Number(currentYear),
        amount: duesAmount,
        paid_date: payment ? payment.paid_date : null,
        status: payment ? payment.status : 'unpaid',
        payment_id: payment ? payment.id : null
      };
    });

    const paid = result.filter(r => r.status === 'paid').length;
    const unpaid = result.filter(r => r.status === 'unpaid').length;

    res.json({ payments: result, summary: { total: members.length, paid, unpaid, amount: duesAmount } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/dues/payments/:memberId - Mark as paid/unpaid
router.put('/payments/:memberId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { month, year, status } = req.body;
    const settings = queryGet('SELECT * FROM dues_settings ORDER BY effective_date DESC LIMIT 1');
    const duesAmount = settings ? settings.amount : 0;

    const existing = queryGet(
      'SELECT * FROM dues_payments WHERE member_id = ? AND month = ? AND year = ?',
      [req.params.memberId, month, year]
    );

    if (status === 'paid') {
      const today = new Date().toISOString().split('T')[0];
      
      if (existing) {
        queryRun('UPDATE dues_payments SET status = ?, paid_date = ?, amount = ? WHERE id = ?', ['paid', today, duesAmount, existing.id]);
      } else {
        // Create payment record and transaction
        const txResult = queryRun(
          'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['income', 1, duesAmount, `Iuran bulan ${month}/${year}`, today, req.params.memberId, req.user.id]
        );

        queryRun(
          'INSERT INTO dues_payments (member_id, month, year, amount, paid_date, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.params.memberId, month, year, duesAmount, today, 'paid', txResult.lastInsertRowid]
        );
      }
    } else {
      if (existing) {
        if (existing.transaction_id) {
          queryRun('DELETE FROM transactions WHERE id = ?', [existing.transaction_id]);
        }
        queryRun('DELETE FROM dues_payments WHERE id = ?', [existing.id]);
      }
    }

    res.json({ message: 'Status pembayaran berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dues/generate - Generate dues for all members for a month
router.post('/generate', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { month, year } = req.body;
    const members = queryAll('SELECT * FROM members WHERE status = ?', ['active']);
    const settings = queryGet('SELECT * FROM dues_settings ORDER BY effective_date DESC LIMIT 1');
    
    if (!settings) return res.status(400).json({ error: 'Setting iuran belum dikonfigurasi' });

    let created = 0;
    
    // Simulate transaction by running all inserts
    for (const member of members) {
        try {
            const res = queryRun(
                'INSERT OR IGNORE INTO dues_payments (member_id, month, year, amount, status) VALUES (?, ?, ?, ?, ?)',
                [member.id, month, year, settings.amount, 'unpaid']
            );
            if (res.changes > 0) created++;
        } catch(e) {
            console.error('Error inserting due for member', member.id, e);
        }
    }

    res.json({ message: `${created} record iuran berhasil dibuat`, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
