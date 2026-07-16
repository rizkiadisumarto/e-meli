const express = require('express');
const { queryAllAsync, queryGetAsync, queryRunAsync } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/dues/settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await queryGetAsync('SELECT * FROM dues_settings ORDER BY id DESC LIMIT 1');
    res.json(settings || { amount: 0, period: 'monthly' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dues/settings
router.post('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { amount, effective_date } = req.body;
    if (!amount || !effective_date) {
      return res.status(400).json({ error: 'Nominal dan tanggal efektif harus diisi' });
    }

    const result = await queryRunAsync(
      'INSERT INTO dues_settings (amount, period, effective_date) VALUES ($1, $2, $3) RETURNING id',
      [amount, 'monthly', effective_date]
    );

    const setting = await queryGetAsync('SELECT * FROM dues_settings WHERE id = $1', [result.lastInsertRowid]);
    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dues/payments?month=&year=
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    // Only get members who have been generated (have a dues_payment record for this month/year)
    const payments = await queryAllAsync(`
      SELECT dp.*, m.name as member_name, m.address as member_address
      FROM dues_payments dp
      INNER JOIN members m ON dp.member_id = m.id
      WHERE dp.month = $1 AND dp.year = $2
      ORDER BY m.name
    `, [currentMonth, currentYear]);

    const settings = await queryGetAsync('SELECT * FROM dues_settings ORDER BY id DESC LIMIT 1');
    const duesAmount = settings ? settings.amount : 0;

    const result = payments.map(p => ({
      member_id: p.member_id,
      member_name: p.member_name,
      member_address: p.member_address,
      month: Number(currentMonth),
      year: Number(currentYear),
      amount: p.amount || duesAmount,
      paid_date: p.paid_date,
      status: p.status,
      payment_id: p.id
    }));

    const paid = result.filter(r => r.status === 'paid').length;
    const unpaid = result.filter(r => r.status === 'unpaid').length;

    res.json({ payments: result, summary: { total: result.length, paid, unpaid, amount: duesAmount } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/dues/payments/:memberId - Mark as paid/unpaid
router.put('/payments/:memberId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { month, year, status } = req.body;
    const settings = await queryGetAsync('SELECT * FROM dues_settings ORDER BY id DESC LIMIT 1');
    const duesAmount = settings ? settings.amount : 0;

    const existing = await queryGetAsync(
      'SELECT * FROM dues_payments WHERE member_id = $1 AND month = $2 AND year = $3',
      [req.params.memberId, month, year]
    );

    if (status === 'paid') {
      const today = new Date().toISOString().split('T')[0];

      if (existing) {
        // Update payment status
        await queryRunAsync('UPDATE dues_payments SET status = $1, paid_date = $2, amount = $3 WHERE id = $4', ['paid', today, duesAmount, existing.id]);

        // Create transaction if not linked yet
        if (!existing.transaction_id) {
          const txResult = await queryRunAsync(
            'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            ['income', 1, duesAmount, `Iuran bulan ${month}/${year}`, today, req.params.memberId, req.user.id]
          );
          await queryRunAsync('UPDATE dues_payments SET transaction_id = $1 WHERE id = $2', [txResult.lastInsertRowid, existing.id]);
        }
      } else {
        // Create payment record and transaction
        const txResult = await queryRunAsync(
          'INSERT INTO transactions (type, category_id, amount, description, date, member_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          ['income', 1, duesAmount, `Iuran bulan ${month}/${year}`, today, req.params.memberId, req.user.id]
        );

        await queryRunAsync(
          'INSERT INTO dues_payments (member_id, month, year, amount, paid_date, status, transaction_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [req.params.memberId, month, year, duesAmount, today, 'paid', txResult.lastInsertRowid]
        );
      }
    } else {
      if (existing) {
        if (existing.transaction_id) {
          await queryRunAsync('DELETE FROM transactions WHERE id = $1', [existing.transaction_id]);
        }
        await queryRunAsync('DELETE FROM dues_payments WHERE id = $1', [existing.id]);
      }
    }

    res.json({ message: 'Status pembayaran berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dues/generate - Generate dues for all members for a month
router.post('/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ error: 'Bulan dan tahun harus diisi' });

    const members = await queryAllAsync('SELECT * FROM members WHERE status = $1', ['active']);
    if (members.length === 0) return res.status(400).json({ error: 'Tidak ada anggota aktif' });

    const settings = await queryGetAsync('SELECT * FROM dues_settings ORDER BY id DESC LIMIT 1');
    if (!settings) return res.status(400).json({ error: 'Setting iuran belum dikonfigurasi. Silakan atur nominal iuran terlebih dahulu.' });

    let created = 0;
    let skipped = 0;

    for (const member of members) {
      // Check if payment already exists for this member/month/year
      const existing = await queryGetAsync(
        'SELECT id FROM dues_payments WHERE member_id = $1 AND month = $2 AND year = $3',
        [member.id, month, year]
      );

      if (existing) {
        skipped++;
        continue;
      }

      await queryRunAsync(
        'INSERT INTO dues_payments (member_id, month, year, amount, status) VALUES ($1, $2, $3, $4, $5)',
        [member.id, month, year, settings.amount, 'unpaid']
      );
      created++;
    }

    const msg = `${created} tagihan berhasil dibuat${skipped > 0 ? `, ${skipped} sudah ada sebelumnya` : ''}`;
    res.json({ message: msg, created, skipped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
