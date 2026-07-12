import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/UI/StatCard';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Wallet, 
  Users,
  AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './DashboardPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [duesSummary, setDuesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [summaryRes, monthlyRes, recentRes, duesRes] = await Promise.all([
          fetch('/api/reports/summary', { headers }),
          fetch('/api/reports/monthly', { headers }),
          fetch('/api/reports/recent-transactions?limit=5', { headers }),
          fetch('/api/reports/dues-summary', { headers })
        ]);

        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (monthlyRes.ok) setMonthlyData(await monthlyRes.json());
        if (recentRes.ok) setRecentTransactions(await recentRes.json());
        if (duesRes.ok) setDuesSummary(await duesRes.json());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading dashboard...</div>;
  }

  // Chart configuration
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const chartData = {
    labels: monthlyData.map(d => monthNames[d.month - 1]),
    datasets: [
      {
        label: 'Pemasukan',
        data: monthlyData.map(d => d.income),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Pengeluaran',
        data: monthlyData.map(d => d.expense),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9CA3AF' }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>Selamat datang kembali, {user?.full_name}! 👋</h2>
        <p className="text-muted">Berikut adalah ringkasan keuangan kas saat ini.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Saldo" 
          value={formatCurrency(summary?.balance || 0)} 
          icon={<Wallet size={24} />} 
          color="primary"
        />
        <StatCard 
          title="Pemasukan (Bulan Ini)" 
          value={formatCurrency(monthlyData[new Date().getMonth()]?.income || 0)} 
          icon={<ArrowDownToLine size={24} />} 
          color="secondary"
        />
        <StatCard 
          title="Pengeluaran (Bulan Ini)" 
          value={formatCurrency(monthlyData[new Date().getMonth()]?.expense || 0)} 
          icon={<ArrowUpFromLine size={24} />} 
          color="danger"
        />
        <StatCard 
          title="Anggota Aktif" 
          value={`${summary?.total_members || 0} Orang`} 
          icon={<Users size={24} />} 
          color="warning"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="glass-card col-span-2 chart-container">
          <div className="card-header">
            <h3>Arus Kas Tahunan</h3>
          </div>
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Side Panels */}
        <div className="flex flex-col gap-6">
          
          {/* Dues Summary Widget */}
          <div className="glass-card dues-widget">
            <div className="card-header">
              <h3>Iuran Bulan Ini</h3>
            </div>
            <div className="dues-stats mt-4">
              <div className="dues-progress-circle">
                <svg viewBox="0 0 36 36" className="circular-chart primary">
                  <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${(duesSummary?.paid / duesSummary?.total_members) * 100 || 0}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">
                    {Math.round((duesSummary?.paid / duesSummary?.total_members) * 100 || 0)}%
                  </text>
                </svg>
              </div>
              <div className="dues-details">
                <div className="dues-item">
                  <span className="dot bg-primary"></span>
                  <span className="text-muted text-sm">Sudah Bayar</span>
                  <span className="font-bold">{duesSummary?.paid || 0}</span>
                </div>
                <div className="dues-item">
                  <span className="dot bg-danger"></span>
                  <span className="text-muted text-sm">Belum Bayar</span>
                  <span className="font-bold">{duesSummary?.unpaid || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Widget */}
          <div className="glass-card recent-widget flex-1">
            <div className="card-header">
              <h3>Transaksi Terbaru</h3>
            </div>
            <div className="recent-list mt-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(tx => (
                  <div key={tx.id} className="recent-item">
                    <div className={`tx-icon ${tx.type === 'income' ? 'bg-primary-light text-primary' : 'bg-danger-light text-danger'}`}>
                      {tx.type === 'income' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                    </div>
                    <div className="tx-details">
                      <div className="tx-desc">{tx.description || tx.category_name}</div>
                      <div className="tx-date">{formatDate(tx.date)}</div>
                    </div>
                    <div className={`tx-amount font-bold ${tx.type === 'income' ? 'text-primary' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-muted text-center gap-2">
                  <AlertCircle size={32} className="opacity-50" />
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
