import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Download, TrendingUp, Calendar, FileText, PieChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  if (loading) return <div className="flex justify-center p-8">Loading reports...</div>;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const barChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Pemasukan',
        data: monthlyData.map(d => d.income),
        backgroundColor: '#10B981',
      },
      {
        label: 'Pengeluaran',
        data: monthlyData.map(d => d.expense),
        backgroundColor: '#EF4444',
      }
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
    <div className="page-container">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2>Laporan Keuangan</h2>
          <p className="text-muted text-sm mt-1">Analisis dan ringkasan data kas</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Download size={18} /> Cetak Laporan
        </button>
      </div>

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

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 glass-card h-[400px] flex flex-col">
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
