import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX, X, FileSpreadsheet } from 'lucide-react';
import { exportMembers } from '../utils/exportExcel';
import './MembersPage.css';

const MembersPage = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', status: 'active' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({ name: '', phone: '', address: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({ name: member.name, phone: member.phone || '', address: member.address || '', status: member.status });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus anggota "${name}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
      const method = editingMember ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container relative">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2>Anggota Kas</h2>
          <p className="text-muted text-sm mt-1">Kelola data warga/anggota yang terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => exportMembers(filteredMembers.length > 0 ? filteredMembers : members)}>
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          {isAdmin && (
            <button className="btn btn-primary shadow-glow" onClick={openAddModal}>
              <Plus size={18} /> Tambah Anggota
            </button>
          )}
        </div>
      </div>

      <div className="glass-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="search-bar" style={{ width: '300px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari nama atau alamat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input rounded-full pl-10" 
            />
          </div>
          <div className="text-sm text-muted">
            Total: <strong className="text-main">{filteredMembers.length}</strong> anggota
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Anggota</th>
                <th>Alamat</th>
                <th>No. HP</th>
                <th className="text-center">Status</th>
                {isAdmin && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-8">Loading...</td></tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-card-hover transition-colors">
                    <td className="font-medium text-main">{m.name}</td>
                    <td className="text-muted">{m.address || '-'}</td>
                    <td className="text-muted">{m.phone || '-'}</td>
                    <td className="text-center">
                      <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-danger'} flex items-center justify-center gap-1 w-fit mx-auto`}>
                        {m.status === 'active' ? <UserCheck size={12}/> : <UserX size={12}/>}
                        {m.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <button className="btn-icon text-primary mx-1 hover:bg-primary-light" onClick={() => openEditModal(m)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon text-danger mx-1 hover:bg-danger-light" onClick={() => handleDelete(m.id, m.name)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted">Tidak ada anggota ditemukan.</td></tr>
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
              <h3 className="text-lg font-bold">{editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group mb-0">
                  <label className="form-label">Nama Lengkap <span className="text-danger">*</span></label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Budi Santoso" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Nomor HP/WhatsApp</label>
                  <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Contoh: 08123456789" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Alamat / Nomor Rumah</label>
                  <textarea className="form-textarea" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Contoh: Blok A No. 12"></textarea>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MembersPage;
