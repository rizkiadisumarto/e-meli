import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowDownToLine, ArrowUpFromLine, Search, Edit2, Trash2, X } from 'lucide-react';

const TransactionsPage = () => {
  const { isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [formData, setFormData] = useState({
    type: 'income',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    member_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const query = filterType ? `?type=${filterType}` : '';
      
      const [txRes, catRes, memRes] = await Promise.all([
        fetch(`/api/transactions${query}`, { headers }),
        fetch(`/api/transactions/categories/all`, { headers }),
        fetch(`/api/members`, { headers })
      ]);

      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }
      if (catRes.ok) setCategories(await catRes.json());
      if (memRes.ok) setMembers(await memRes.json());

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(tx => 
    (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = (type = 'income') => {
    setEditingTx(null);
    setFormData({
      type,
      category_id: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      member_id: ''
    });
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type,
      category_id: tx.category_id || '',
      amount: tx.amount,
      description: tx.description || '',
      date: tx.date,
      member_id: tx.member_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini? Saldo kas akan terpengaruh.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingTx ? `/api/transactions/${editingTx.id}` : '/api/transactions';
      const method = editingTx ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          category_id: formData.category_id ? Number(formData.category_id) : null,
          member_id: formData.member_id ? Number(formData.member_id) : null
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container relative">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2>Transaksi Keuangan</h2>
          <p className="text-muted text-sm mt-1">Catatan pemasukan dan pengeluaran kas</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="btn btn-primary shadow-glow" onClick={() => openAddModal('income')}>
              <ArrowDownToLine size={18} /> Pemasukan Baru
            </button>
            <button className="btn btn-danger shadow-glow" onClick={() => openAddModal('expense')}>
              <ArrowUpFromLine size={18} /> Pengeluaran Baru
            </button>
          </div>
        )}
      </div>

      <div className="glass-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="search-bar" style={{ width: '300px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input rounded-full pl-10" 
            />
          </div>
          <div className="flex gap-2">
            <button 
              className={`btn ${filterType === '' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('')}
            >
              Semua
            </button>
            <button 
              className={`btn ${filterType === 'income' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('income')}
            >
              Pemasukan
            </button>
            <button 
              className={`btn ${filterType === 'expense' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('expense')}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kategori / Keterangan</th>
                <th>Dari / Kepada</th>
                <th className="text-right">Nominal</th>
                {isAdmin && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8">Loading...</td></tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-card-hover transition-colors">
                    <td>{formatDate(tx.date)}</td>
                    <td>
                      <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.type === 'income' ? <ArrowDownToLine size={12} className="mr-1 inline"/> : <ArrowUpFromLine size={12} className="mr-1 inline"/>}
                        {tx.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-main">{tx.category_name || '-'}</div>
                      <div className="text-xs text-muted mt-1">{tx.description}</div>
                    </td>
                    <td className="text-muted">{tx.member_name || '-'}</td>
                    <td className={`text-right font-bold ${tx.type === 'income' ? 'text-primary' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <button className="btn-icon text-primary mx-1 hover:bg-primary-light" onClick={() => openEditModal(tx)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon text-danger mx-1 hover:bg-danger-light" onClick={() => handleDelete(tx.id)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted">Tidak ada transaksi ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {formData.type === 'income' ? (
                  <><ArrowDownToLine size={20} className="text-primary"/> {editingTx ? 'Edit Pemasukan' : 'Pemasukan Baru'}</>
                ) : (
                  <><ArrowUpFromLine size={20} className="text-danger"/> {editingTx ? 'Edit Pengeluaran' : 'Pengeluaran Baru'}</>
                )}
              </h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Tanggal <span className="text-danger">*</span></label>
                    <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Nominal (Rp) <span className="text-danger">*</span></label>
                    <input type="number" min="0" className="form-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required placeholder="Contoh: 50000" />
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Kategori</label>
                  <select className="form-select" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">-- Pilih Kategori --</option>
                    {categories.filter(c => c.type === formData.type).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">{formData.type === 'income' ? 'Diterima dari (opsional)' : 'Dibayarkan kepada (opsional)'}</label>
                  <select className="form-select" value={formData.member_id} onChange={e => setFormData({...formData, member_id: e.target.value})}>
                    <option value="">-- Bukan Anggota / Umum --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Keterangan Tambahan</label>
                  <textarea className="form-textarea" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Pembelian alat kebersihan"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
