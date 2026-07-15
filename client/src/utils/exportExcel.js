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
