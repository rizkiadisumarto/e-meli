import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Download, TrendingUp, Calendar, FileText, PieChart, Printer } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './ReportsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Monthly report state
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedYear]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [sumRes, monthRes, catRes] = await Promise.all([
        fetch('/api/reports/summary', { headers }),
        fetch(`/api/reports/monthly?year=${selectedYear}`, { headers }),
        fetch('/api/reports/by-category', { headers })
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (monthRes.ok) setMonthlyData(await monthRes.json());
      if (catRes.ok) setCategoryData(await catRes.json());
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoadingMonthly(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const res = await fetch(`/api/transactions?start_date=${startDate}&end_date=${endDate}&limit=200`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMonthlyTransactions(data.transactions || []);

        // Calculate monthly summary
        let totalIncome = 0;
        let totalExpense = 0;
        (data.transactions || []).forEach(tx => {
          if (tx.type === 'income') totalIncome += tx.amount;
          else totalExpense += tx.amount;
        });
        setMonthlySummary({
          total_income: totalIncome,
          total_expense: totalExpense,
          balance: totalIncome - totalExpense,
          total_transactions: (data.transactions || []).length
        });
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoadingMonthly(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const handlePrintMonthly = async () => {
    let transactions = monthlyTransactions;
    let summary = monthlySummary;

    // Fetch fresh data before printing if not loaded yet
    if (!transactions || transactions.length === 0 || !summary) {
      setLoadingMonthly(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        const res = await fetch(`/api/transactions?start_date=${startDate}&end_date=${endDate}&limit=200`, { headers });
        if (res.ok) {
          const data = await res.json();
          transactions = data.transactions || [];
          let totalIncome = 0, totalExpense = 0;
          transactions.forEach(tx => {
            if (tx.type === 'income') totalIncome += tx.amount;
            else totalExpense += tx.amount;
          });
          summary = { total_income: totalIncome, total_expense: totalExpense, balance: totalIncome - totalExpense, total_transactions: transactions.length };
          setMonthlyTransactions(transactions);
          setMonthlySummary(summary);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingMonthly(false);
      }
    }

    // Build print HTML
    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Laporan Bulanan</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 25px; color: #333; }
        .org { text-align: center; font-size: 11px; color: #666; margin-bottom: 3px; }
        h1 { text-align: center; font-size: 16px; margin-bottom: 2px; }
        h2 { text-align: center; color: #555; font-size: 12px; margin-bottom: 15px; }
        .info { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 12px; color: #555; }
        .info b { color: #333; }
        .summary { display: flex; gap: 10px; margin-bottom: 15px; }
        .sc { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; text-align: center; }
        .sc .l { font-size: 9px; color: #666; text-transform: uppercase; }
        .sc .v { font-size: 13px; font-weight: bold; margin-top: 2px; }
        .green { color: #059669; }
        .red { color: #DC2626; }
        .title { font-size: 11px; font-weight: bold; margin: 12px 0 6px; padding-bottom: 4px; border-bottom: 2px solid #333; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #eee; padding: 5px 6px; border: 1px solid #ccc; font-size: 9px; text-transform: uppercase; }
        td { padding: 4px 6px; border: 1px solid #ddd; }
        .tr { text-align: right; }
        .tc { text-align: center; }
        .footer { margin-top: 15px; font-size: 9px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      <div class="org">E-Meli - Sistem Manajemen Keuangan Komunitas</div>
      <h1>LAPORAN KEUANGAN BULANAN</h1>
      <h2>${monthNames[selectedMonth]} ${selectedYear}</h2>
      <div class="info">
        <span><b>Periode:</b> 1 ${monthNames[selectedMonth]} ${selectedYear} - ${new Date(selectedYear, selectedMonth, 0).getDate()} ${monthNames[selectedMonth]} ${selectedYear}</span>
        <span><b>Dicetak:</b> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="summary">
        <div class="sc"><div class="l">Pemasukan</div><div class="v green">${formatCurrency(summary.total_income)}</div></div>
        <div class="sc"><div class="l">Pengeluaran</div><div class="v red">${formatCurrency(summary.total_expense)}</div></div>
        <div class="sc"><div class="l">Saldo</div><div class="v">${formatCurrency(summary.balance)}</div></div>
        <div class="sc"><div class="l">Transaksi</div><div class="v">${summary.total_transactions} transaksi</div></div>
      </div>
      <div class="title">Detail Transaksi</div>
      <table>
        <thead><tr><th>No</th><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Keterangan</th><th>Anggota</th><th class="tr">Nominal</th></tr></thead>
        <tbody>
          ${transactions.length > 0 ? transactions.map((tx, i) => `
            <tr>
              <td class="tc">${i + 1}</td>
              <td>${formatDate(tx.date)}</td>
              <td class="tc">${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
              <td>${tx.category_name || '-'}</td>
              <td>${tx.description || '-'}</td>
              <td>${tx.member_name || '-'}</td>
              <td class="tr ${tx.type === 'income' ? 'green' : 'red'}">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</td>
            </tr>
          `).join('') : '<tr><td colspan="7" class="tc" style="padding:15px;color:#999">Tidak ada transaksi di periode ini</td></tr>'}
        </tbody>
      </table>
      <div class="footer">Laporan ini dicetak secara otomatis oleh sistem E-Meli | ${new Date().toLocaleDateString('id-ID')}</div>
      </body></html>
    `;

    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    };
  };

  if (loading) return <div className="flex justify-center p-8">Loading reports...</div>;

  const barChartData = {
    labels: monthShort,
    datasets: [
      { label: 'Pemasukan', data: monthlyData.map(d => d.income), backgroundColor: '#10B981' },
      { label: 'Pengeluaran', data: monthlyData.map(d => d.expense), backgroundColor: '#EF4444' }
    ]
  };

  const expenseCategories = categoryData.filter(c => c.type === 'expense');
  const pieChartData = {
    labels: expenseCategories.map(c => c.name) || ['Tidak ada data'],
    datasets: [{
      data: expenseCategories.length > 0 ? expenseCategories.map(c => c.total) : [1],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="page-container reports-page">
      <div className="page-header reports-header flex justify-between items-center mb-6">
        <div>
          <h2>Laporan Keuangan</h2>
          <p className="text-muted text-sm mt-1">Analisis dan ringkasan data kas</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Download size={18} /> Cetak Laporan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="glass-card">
          <div className="text-sm text-muted mb-1">Total Pemasukan</div>
          <div className="text-xl font-bold text-primary">{formatCurrency(summary?.total_income)}</div>
        </div>
        <div className="glass-card">
          <div className="text-sm text-muted mb-1">Total Pengeluaran</div>
          <div className="text-xl font-bold text-danger">{formatCurrency(summary?.total_expense)}</div>
        </div>
        <div className="glass-card">
          <div className="text-sm text-muted mb-1">Saldo Akhir</div>
          <div className="text-xl font-bold text-main">{formatCurrency(summary?.balance)}</div>
        </div>
        <div className="glass-card bg-primary-light border-primary">
          <div className="text-sm text-muted mb-1 text-primary">Jumlah Transaksi</div>
          <div className="text-xl font-bold text-primary">{summary?.total_transactions} trx</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 glass-card h-[400px] flex flex-col chart-container-mobile">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-muted flex items-center gap-2"><BarChart3 size={16}/> Arus Kas Bulanan</h3>
            <select className="form-select text-sm py-1" style={{width: '120px'}} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <Bar data={barChartData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } }, x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } } }, plugins: { legend: { labels: { color: '#9CA3AF' } } } }} />
          </div>
        </div>
        <div className="glass-card h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-muted mb-4 flex items-center gap-2"><PieChart size={16}/> Proporsi Pengeluaran</h3>
          <div className="flex-1 min-h-0 flex justify-center">
            {expenseCategories.length > 0 ? (
              <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', font: { size: 10 } } } } }} />
            ) : (
              <div className="flex items-center text-muted">Belum ada pengeluaran</div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      <div className="glass-card mb-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-sm font-bold text-muted flex items-center gap-2"><Calendar size={16}/> Laporan Bulanan</h3>
          <div className="flex flex-wrap gap-2 items-center reports-controls">
            <select className="form-select text-sm py-1" style={{minWidth: '120px', flex: '1 1 auto'}} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {monthNames.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <select className="form-select text-sm py-1" style={{minWidth: '90px', flex: '1 1 auto'}} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" style={{flex: '1 1 auto'}} onClick={fetchMonthlyReport} disabled={loadingMonthly}>
              <FileText size={14}/> {loadingMonthly ? 'Memuat...' : 'Tampilkan'}
            </button>
            <button className="btn btn-outline btn-sm" style={{flex: '1 1 auto'}} onClick={handlePrintMonthly} disabled={loadingMonthly}>
              <Printer size={14}/> Cetak
            </button>
          </div>
        </div>

        {monthlySummary && (
          <div className="grid monthly-summary gap-3 mb-4" style={{gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'}}>
            <div style={{padding:'0.75rem',background:'var(--primary-light)',borderRadius:'8px',textAlign:'center'}}>
              <div className="text-xs text-muted">Pemasukan</div>
              <div className="font-bold text-primary" style={{fontSize:'0.9rem'}}>{formatCurrency(monthlySummary.total_income)}</div>
            </div>
            <div style={{padding:'0.75rem',background:'var(--danger-light)',borderRadius:'8px',textAlign:'center'}}>
              <div className="text-xs text-muted">Pengeluaran</div>
              <div className="font-bold text-danger" style={{fontSize:'0.9rem'}}>{formatCurrency(monthlySummary.total_expense)}</div>
            </div>
            <div style={{padding:'0.75rem',background:'rgba(255,255,255,0.05)',borderRadius:'8px',textAlign:'center'}}>
              <div className="text-xs text-muted">Saldo</div>
              <div className="font-bold" style={{fontSize:'0.9rem'}}>{formatCurrency(monthlySummary.balance)}</div>
            </div>
            <div style={{padding:'0.75rem',background:'rgba(255,255,255,0.05)',borderRadius:'8px',textAlign:'center'}}>
              <div className="text-xs text-muted">Transaksi</div>
              <div className="font-bold" style={{fontSize:'0.9rem'}}>{monthlySummary.total_transactions} trx</div>
            </div>
          </div>
        )}

        {loadingMonthly ? (
          <div className="text-center py-8 text-muted">Memuat data laporan...</div>
        ) : monthlyTransactions.length > 0 ? (
          <div className="table-container">
            <table className="table text-sm reports-table">
              <thead>
                <tr>
                  <th className="text-center">No</th>
                  <th>Tanggal</th>
                  <th className="text-center">Tipe</th>
                  <th>Kategori</th>
                  <th>Keterangan</th>
                  <th>Anggota</th>
                  <th className="text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTransactions.map((tx, i) => (
                  <tr key={tx.id}>
                    <td className="text-center">{i + 1}</td>
                    <td>{formatDate(tx.date)}</td>
                    <td className="text-center">
                      <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td>{tx.category_name || '-'}</td>
                    <td>{tx.description || '-'}</td>
                    <td>{tx.member_name || '-'}</td>
                    <td className={`text-right font-bold ${tx.type === 'income' ? 'text-primary' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : monthlySummary ? (
          <div className="text-center py-8 text-muted">
            <p>Tidak ada transaksi di bulan {monthNames[selectedMonth]} {selectedYear}</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            <p>Pilih bulan dan tahun, lalu klik "Tampilkan" untuk melihat laporan</p>
          </div>
        )}
      </div>

      {/* Category Recap */}
      <div className="glass-card">
        <h3 className="text-sm font-bold text-muted mb-4 flex items-center gap-2"><FileText size={16}/> Rekap Kategori (Keseluruhan)</h3>
        <div className="table-container">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Tipe</th>
                <th className="text-right">Total (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.length > 0 ? categoryData.map((c, i) => (
                <tr key={i}>
                  <td className="font-medium">{c.name}</td>
                  <td><span className={`badge ${c.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{c.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                  <td className="text-right font-bold">{formatCurrency(c.total)}</td>
                </tr>
              )) : <tr><td colSpan="3" className="text-center py-4 text-muted">Data kosong</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
