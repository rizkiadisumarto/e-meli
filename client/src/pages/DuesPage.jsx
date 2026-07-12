import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { formatNumberInput, parseNumberInput } from '../utils/format';
import './DuesPage.css';

const DuesPage = () => {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ amount: '', effective_date: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDuesData();
  }, [selectedMonth, selectedYear]);

  const fetchDuesData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [payRes, setRes] = await Promise.all([
        fetch(`/api/dues/payments?month=${selectedMonth}&year=${selectedYear}`, { headers }),
        fetch(`/api/dues/settings`, { headers })
      ]);

      if (payRes.ok) {
        const data = await payRes.json();
        setPayments(data.payments || []);
        setSummary(data.summary || null);
      }
      if (setRes.ok) {
        const data = await setRes.json();
        setSettings(data);
        setSettingsForm({ amount: formatNumberInput(data.amount || 0), effective_date: new Date().toISOString().split('T')[0] });
      }

    } catch (error) {
      console.error('Error fetching dues data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const togglePaymentStatus = async (memberId, currentStatus) => {
    if (!isAdmin) return;
    
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/dues/payments/${memberId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          status: newStatus
        })
      });
      
      if (res.ok) fetchDuesData();
    } catch (error) {
      console.error('Error toggling payment status:', error);
    }
  };

  const generateDues = async () => {
    if (!isAdmin) return;
    if (!window.confirm(`Generate tagihan untuk bulan ${monthNames[selectedMonth]} ${selectedYear}?`)) return;

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dues/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchDuesData();
      } else {
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error generating dues:', error);
      alert('Gagal menghubungi server');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dues/settings', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseNumberInput(settingsForm.amount),
          effective_date: settingsForm.effective_date
        })
      });
      
      if (res.ok) {
        setShowSettingsModal(false);
        fetchDuesData();
      } else {
        const err = await res.json();
        alert(err.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving dues settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="page-container relative">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2>Iuran Bulanan</h2>
          <p className="text-muted text-sm mt-1">Pencatatan iuran kas rutin anggota</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => setShowSettingsModal(true)}>
              <Settings size={18} /> Pengaturan Iuran
            </button>
            <button className="btn btn-primary shadow-glow" onClick={generateDues} disabled={generating}>
              <RefreshCw size={18} className={generating ? 'animate-spin' : ''} /> {generating ? 'Memproses...' : 'Generate Tagihan'}
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SUMMARY */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="glass-card flex flex-col justify-center">
          <label className="text-sm text-muted mb-2 font-bold uppercase">Pilih Periode</label>
          <div className="flex gap-2">
            <select className="form-select flex-1" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {monthNames.map((m, i) => i !== 0 && <option key={i} value={i}>{m}</option>)}
            </select>
            <select className="form-select flex-1" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        
        <div className="glass-card flex flex-col justify-center">
          <div className="text-sm text-muted mb-1 font-bold uppercase">Terkumpul Bulan Ini</div>
          <div className="text-2xl font-bold text-primary">{summary?.paid || 0} <span className="text-sm text-muted font-normal">dari {summary?.total || 0} Anggota</span></div>
        </div>
        
        <div className="glass-card flex flex-col justify-center">
          <div className="text-sm text-muted mb-1 font-bold uppercase">Nominal Iuran (per orang)</div>
          <div className="text-2xl font-bold text-main">{formatCurrency(summary?.amount || settings?.amount || 0)}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-card mb-6">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Anggota</th>
                <th>Alamat</th>
                <th className="text-right">Nominal</th>
                <th className="text-center">Tanggal Bayar</th>
                <th className="text-center">Status</th>
                {isAdmin && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8">Loading...</td></tr>
              ) : payments.length > 0 ? (
                payments.map(p => (
                  <tr key={p.member_id} className="hover:bg-card-hover transition-colors">
                    <td className="font-medium text-main">{p.member_name}</td>
                    <td className="text-muted">{p.member_address || '-'}</td>
                    <td className="text-right font-medium">{formatCurrency(p.amount)}</td>
                    <td className="text-center text-muted">{p.paid_date ? new Date(p.paid_date).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="text-center">
                      <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                        {p.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <button
                          className={`btn ${p.status === 'paid' ? 'btn-danger' : 'btn-primary'} text-xs py-1 px-3`}
                          onClick={() => togglePaymentStatus(p.member_id, p.status)}
                        >
                          {p.status === 'paid' ? <><XCircle size={14} /> Batal Lunas</> : <><CheckCircle size={14} /> Set Lunas</>}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted">
                  <p>Belum ada data iuran untuk periode ini.</p>
                  {isAdmin && <p className="text-xs mt-2">Klik "Generate Tagihan" untuk membuat tagihan baru.</p>}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold flex items-center gap-2"><Settings size={20}/> Pengaturan Iuran</h3>
              <button className="btn-icon" onClick={() => setShowSettingsModal(false)}><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="modal-body flex flex-col gap-4">
                <div className="alert bg-warning-light text-warning p-4 rounded-lg text-sm mb-2 border border-warning">
                  Perubahan nominal iuran akan berlaku ke depan sesuai tanggal efektif. Tagihan bulan-bulan sebelumnya tidak akan berubah.
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Nominal Iuran Baru (Rp) <span className="text-danger">*</span></label>
                  <input type="text" inputMode="numeric" className="form-input" value={settingsForm.amount} onChange={e => setSettingsForm({...settingsForm, amount: formatNumberInput(e.target.value)})} required placeholder="Contoh: 50.000" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Tanggal Efektif <span className="text-danger">*</span></label>
                  <input type="date" className="form-input" value={settingsForm.effective_date} onChange={e => setSettingsForm({...settingsForm, effective_date: e.target.value})} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowSettingsModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuesPage;
