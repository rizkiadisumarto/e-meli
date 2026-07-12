import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2, Edit2, X, Settings as SettingsIcon } from 'lucide-react';

const SettingsPage = () => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState({ org_name: '', org_address: '', org_phone: '', org_description: '' });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [newCat, setNewCat] = useState({ name: '', type: 'income' });
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'viewer' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editingCat, setEditingCat] = useState(null);
  const [editCatForm, setEditCatForm] = useState({ name: '', type: 'income' });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ full_name: '', role: 'viewer', password: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [setRes, catRes, usrRes] = await Promise.all([
        fetch('/api/settings', { headers }),
        fetch('/api/settings/categories', { headers }),
        fetch('/api/settings/users', { headers })
      ]);

      if (setRes.ok) setSettings(await setRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (usrRes.ok) setUsers(await usrRes.json());
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert('Pengaturan umum berhasil disimpan');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // --- Categories ---
  const addCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/categories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        setNewCat({ name: '', type: 'income' });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startEditCategory = (cat) => {
    setEditingCat(cat.id);
    setEditCatForm({ name: cat.name, type: cat.type });
  };

  const saveEditCategory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/settings/categories/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editCatForm)
      });
      if (res.ok) {
        setEditingCat(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/settings/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // --- Users ---
  const addUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setNewUser({ username: '', password: '', full_name: '', role: 'viewer' });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user.id);
    setEditUserForm({ full_name: user.full_name, role: user.role, password: '' });
  };

  const saveEditUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const body = { full_name: editUserForm.full_name, role: editUserForm.role };
      if (editUserForm.password) body.password = editUserForm.password;
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Hapus user ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
      else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAdmin) return <div className="p-8 text-center">Akses ditolak</div>;
  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <h2>Pengaturan Sistem</h2>
        <p className="text-muted text-sm mt-1">Konfigurasi data master dan profil organisasi</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* General Settings */}
        <div className="glass-card flex flex-col">
          <h3 className="text-sm font-bold text-muted flex items-center gap-2 mb-4 uppercase">
            <SettingsIcon size={16}/> Profil Organisasi
          </h3>
          <form onSubmit={saveGeneralSettings} className="flex flex-col gap-4 flex-1">
            <div className="form-group mb-0">
              <label className="form-label">Nama Organisasi/Kas</label>
              <input type="text" className="form-input" value={settings.org_name || ''} onChange={e => setSettings({...settings, org_name: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Deskripsi Singkat</label>
              <textarea className="form-textarea" rows="2" value={settings.org_description || ''} onChange={e => setSettings({...settings, org_description: e.target.value})}></textarea>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Alamat Lengkap</label>
              <textarea className="form-textarea" rows="2" value={settings.org_address || ''} onChange={e => setSettings({...settings, org_address: e.target.value})}></textarea>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">No. Telepon / WhatsApp</label>
              <input type="text" className="form-input" value={settings.org_phone || ''} onChange={e => setSettings({...settings, org_phone: e.target.value})} />
            </div>
            <div className="mt-auto pt-4">
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                <Save size={18}/> {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories */}
        <div className="glass-card flex flex-col">
          <h3 className="text-sm font-bold text-muted flex items-center gap-2 mb-4 uppercase">
            <SettingsIcon size={16}/> Kategori Transaksi
          </h3>
          
          <form onSubmit={addCategory} className="flex gap-2 mb-4">
            <input type="text" className="form-input flex-1" placeholder="Nama Kategori" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} required />
            <select className="form-select w-32" value={newCat.type} onChange={e => setNewCat({...newCat, type: e.target.value})}>
              <option value="income">Masuk</option>
              <option value="expense">Keluar</option>
            </select>
            <button type="submit" className="btn btn-primary"><Plus size={18}/></button>
          </form>
          
          <div className="table-container flex-1 overflow-y-auto" style={{ maxHeight: '300px' }}>
            <table className="table text-sm">
              <thead><tr><th>Kategori</th><th>Tipe</th><th className="text-center">Aksi</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>
                      {editingCat === c.id ? (
                        <input type="text" className="form-input" style={{padding:'0.25rem 0.5rem'}} value={editCatForm.name} onChange={e => setEditCatForm({...editCatForm, name: e.target.value})} />
                      ) : c.name}
                    </td>
                    <td>
                      {editingCat === c.id ? (
                        <select className="form-select" style={{padding:'0.25rem 0.5rem'}} value={editCatForm.type} onChange={e => setEditCatForm({...editCatForm, type: e.target.value})}>
                          <option value="income">Pemasukan</option>
                          <option value="expense">Pengeluaran</option>
                        </select>
                      ) : <span className={`badge ${c.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{c.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>}
                    </td>
                    <td className="text-center">
                      {editingCat === c.id ? (
                        <>
                          <button className="btn-icon text-primary" onClick={() => saveEditCategory(c.id)}><Save size={16}/></button>
                          <button className="btn-icon text-muted" onClick={() => setEditingCat(null)}><X size={16}/></button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => startEditCategory(c)}><Edit2 size={16}/></button>
                          <button className="btn-icon text-danger" onClick={() => deleteCategory(c.id)}><Trash2 size={16}/></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="glass-card mb-6">
        <h3 className="text-sm font-bold text-muted flex items-center gap-2 mb-4 uppercase">
          <SettingsIcon size={16}/> Manajemen Pengguna Sistem
        </h3>
        
        <form onSubmit={addUser} className="flex gap-4 mb-4 items-end bg-black bg-opacity-20 p-4 rounded-lg">
          <div className="form-group mb-0 flex-1">
            <label className="form-label">Nama Lengkap</label>
            <input type="text" className="form-input" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required />
          </div>
          <div className="form-group mb-0 flex-1">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
          </div>
          <div className="form-group mb-0 flex-1">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
          </div>
          <div className="form-group mb-0 flex-1">
            <label className="form-label">Peran (Role)</label>
            <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
              <option value="viewer">Viewer (Hanya Lihat)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary h-11"><Plus size={18}/> Tambah</button>
        </form>
        
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Nama Lengkap</th><th>Username</th><th>Peran (Role)</th><th>Password Baru</th><th className="text-center">Aksi</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium text-main">
                    {editingUser === u.id ? (
                      <input type="text" className="form-input" style={{padding:'0.25rem 0.5rem'}} value={editUserForm.full_name} onChange={e => setEditUserForm({...editUserForm, full_name: e.target.value})} />
                    ) : u.full_name}
                  </td>
                  <td>{u.username}</td>
                  <td>
                    {editingUser === u.id ? (
                      <select className="form-select" style={{padding:'0.25rem 0.5rem'}} value={editUserForm.role} onChange={e => setEditUserForm({...editUserForm, role: e.target.value})}>
                        <option value="viewer">Viewer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    ) : <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>{u.role === 'admin' ? 'Administrator' : 'Viewer'}</span>}
                  </td>
                  <td>
                    {editingUser === u.id ? (
                      <input type="password" className="form-input" style={{padding:'0.25rem 0.5rem'}} placeholder="Kosongkan jika tidak diubah" value={editUserForm.password} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} />
                    ) : <span className="text-muted text-sm">-</span>}
                  </td>
                  <td className="text-center">
                    {editingUser === u.id ? (
                      <>
                        <button className="btn-icon text-primary" onClick={() => saveEditUser(u.id)}><Save size={16}/></button>
                        <button className="btn-icon text-muted" onClick={() => setEditingUser(null)}><X size={16}/></button>
                      </>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={() => startEditUser(u)}><Edit2 size={16}/></button>
                        <button className="btn-icon text-danger" onClick={() => deleteUser(u.id)}><Trash2 size={16}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default SettingsPage;
