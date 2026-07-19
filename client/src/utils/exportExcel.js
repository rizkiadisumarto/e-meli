import * as XLSX from 'xlsx';

// Export data to Excel file
export const exportToExcel = (data, filename, sheetName = 'Data') => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto column width
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Export transactions to Excel
export const exportTransactions = (transactions, filename = 'Transaksi') => {
  const data = transactions.map((tx, i) => ({
    'No': i + 1,
    'Tanggal': tx.date,
    'Tipe': tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Kategori': tx.category_name || '-',
    'Keterangan': tx.description || '-',
    'Anggota': tx.member_name || '-',
    'Nominal': tx.amount
  }));

  exportToExcel(data, filename, 'Transaksi');
};

// Export monthly report to Excel
export const exportMonthlyReport = (transactions, summary, month, year, filename = 'Laporan Bulanan') => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    { 'Keterangan': 'Periode', 'Nilai': `${month} ${year}` },
    { 'Keterangan': 'Total Pemasukan', 'Nilai': summary.total_income },
    { 'Keterangan': 'Total Pengeluaran', 'Nilai': summary.total_expense },
    { 'Keterangan': 'Saldo', 'Nilai': summary.balance },
    { 'Keterangan': 'Jumlah Transaksi', 'Nilai': summary.total_transactions }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Transactions sheet
  const txData = transactions.map((tx, i) => ({
    'No': i + 1,
    'Tanggal': tx.date,
    'Tipe': tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    'Kategori': tx.category_name || '-',
    'Keterangan': tx.description || '-',
    'Anggota': tx.member_name || '-',
    'Nominal': tx.amount
  }));
  const wsTx = XLSX.utils.json_to_sheet(txData);
  wsTx['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transaksi');

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Export event data to Excel
export const exportEventData = (event, participants, transactions, budget, filename = 'Data Event') => {
  const wb = XLSX.utils.book_new();

  // Event info sheet
  const eventData = [
    { 'Keterangan': 'Nama Event', 'Nilai': event.name },
    { 'Keterangan': 'Lokasi', 'Nilai': event.location_name || '-' },
    { 'Keterangan': 'Tanggal Mulai', 'Nilai': event.start_date },
    { 'Keterangan': 'Tanggal Selesai', 'Nilai': event.end_date || '-' },
    { 'Keterangan': 'Status', 'Nilai': event.status },
    { 'Keterangan': 'Target Iuran', 'Nilai': event.target_per_person }
  ];
  const wsEvent = XLSX.utils.json_to_sheet(eventData);
  wsEvent['!cols'] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsEvent, 'Info Event');

  // Participants sheet
  if (participants.length > 0) {
    const partData = participants.map((p, i) => ({
      'No': i + 1,
      'Nama': p.name,
      'Absensi': p.attendance === 'present' ? 'Hadir' : 'Absen',
      'Target': p.target,
      'Terbayar': p.amount_paid,
      'Status': p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Belum'
    }));
    const wsPart = XLSX.utils.json_to_sheet(partData);
    wsPart['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsPart, 'Peserta');
  }

  // Transactions sheet
  if (transactions.length > 0) {
    const txData = transactions.map((tx, i) => ({
      'No': i + 1,
      'Tanggal': tx.date,
      'Tipe': tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Kategori': tx.category_name || '-',
      'Keterangan': tx.description || '-',
      'Nominal': tx.amount
    }));
    const wsTx = XLSX.utils.json_to_sheet(txData);
    wsTx['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsTx, 'Transaksi');
  }

  // Budget sheet
  if (budget.items?.length > 0) {
    const budgetData = budget.items.map((b, i) => ({
      'No': i + 1,
      'Item': b.item,
      'Qty': b.qty,
      'Harga Satuan': b.unit_price,
      'Rencana': b.planned_amount,
      'Realisasi': b.actual_amount
    }));
    const wsBudget = XLSX.utils.json_to_sheet(budgetData);
    wsBudget['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsBudget, 'RAB');
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Export members to Excel
export const exportMembers = (members, filename = 'Data Anggota') => {
  const data = members.map((m, i) => ({
    'No': i + 1,
    'Nama': m.name,
    'Alamat': m.address || '-',
    'No. HP': m.phone || '-',
    'Status': m.status === 'active' ? 'Aktif' : 'Non-Aktif'
  }));

  exportToExcel(data, filename, 'Anggota');
};

// Export users to Excel
export const exportUsers = (users, filename = 'Data Pengguna') => {
  const data = users.map((u, i) => ({
    'No': i + 1,
    'Nama Lengkap': u.full_name,
    'Username': u.username,
    'No. HP': u.phone || '-',
    'Role': u.role === 'admin' ? 'Administrator' : u.role === 'committee' ? 'Committee' : 'User'
  }));

  exportToExcel(data, filename, 'Pengguna');
};

// ==================== IMPORT FUNCTIONS ====================

// Parse Excel file and return data
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

// Import transactions from Excel
export const importTransactions = async (file, token) => {
  const data = await parseExcelFile(file);
  const results = { success: 0, failed: 0, errors: [] };

  for (const row of data) {
    try {
      const payload = {
        type: row['Tipe'] === 'Pemasukan' ? 'income' : 'expense',
        category_id: row['Kategori ID'] || null,
        amount: row['Nominal'] || row['amount'] || 0,
        description: row['Keterangan'] || row['description'] || '',
        date: row['Tanggal'] || row['date'] || new Date().toISOString().split('T')[0],
        member_id: row['Anggota ID'] || row['member_id'] || null
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) results.success++;
      else results.failed++;
    } catch (err) {
      results.failed++;
      results.errors.push(err.message);
    }
  }
  return results;
};

// Import members from Excel
export const importMembers = async (file, token) => {
  const data = await parseExcelFile(file);
  const results = { success: 0, failed: 0, errors: [] };

  for (const row of data) {
    try {
      const payload = {
        name: row['Nama'] || row['name'],
        address: row['Alamat'] || row['address'] || '',
        phone: row['No. HP'] || row['phone'] || '',
        status: row['Status'] === 'Non-Aktif' ? 'inactive' : 'active'
      };

      if (!payload.name) { results.failed++; continue; }

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) results.success++;
      else results.failed++;
    } catch (err) {
      results.failed++;
      results.errors.push(err.message);
    }
  }
  return results;
};

// Import events from Excel
export const importEvents = async (file, token) => {
  const data = await parseExcelFile(file);
  const results = { success: 0, failed: 0, errors: [] };

  for (const row of data) {
    try {
      const payload = {
        name: row['Nama Event'] || row['name'],
        start_date: row['Tanggal Mulai'] || row['start_date'],
        end_date: row['Tanggal Selesai'] || row['end_date'] || null,
        location_name: row['Lokasi'] || row['location_name'] || '',
        location_address: row['Alamat'] || row['location_address'] || '',
        status: row['Status'] || 'draft',
        target_per_person: row['Target Iuran'] || row['target_per_person'] || 0,
        description: row['Deskripsi'] || row['description'] || '',
        notes: row['Catatan'] || row['notes'] || ''
      };

      if (!payload.name) { results.failed++; continue; }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) results.success++;
      else results.failed++;
    } catch (err) {
      results.failed++;
      results.errors.push(err.message);
    }
  }
  return results;
};

// Import users from Excel
export const importUsers = async (file, token) => {
  const data = await parseExcelFile(file);
  const results = { success: 0, failed: 0, errors: [] };

  for (const row of data) {
    try {
      const payload = {
        username: row['Username'] || row['username'],
        password: row['Password'] || row['password'] || 'password123',
        full_name: row['Nama Lengkap'] || row['full_name'] || '',
        role: row['Role'] === 'Administrator' ? 'admin' : row['Role'] === 'Committee' ? 'committee' : 'viewer',
        phone: row['No. HP'] || row['phone'] || ''
      };

      if (!payload.username || !payload.full_name) { results.failed++; continue; }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) results.success++;
      else results.failed++;
    } catch (err) {
      results.failed++;
      results.errors.push(err.message);
    }
  }
  return results;
};
