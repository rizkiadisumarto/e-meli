import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, User, X, Lock, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import './Header.css';

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');
    if (!pwForm.current_password || !pwForm.new_password) {
      setPwError('Semua field harus diisi');
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Konfirmasi password tidak cocok');
      return;
    }
    setPwLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password })
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess('Password berhasil diubah');
        setPwForm({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => { setShowPasswordModal(false); setPwSuccess(''); }, 1500);
      } else {
        setPwError(data.error || 'Gagal mengubah password');
      }
    } catch (err) {
      setPwError('Terjadi kesalahan');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Cari..." />
        </div>

        {/* Theme Toggle */}
        <button className="btn-icon" onClick={toggleTheme} title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Profile Dropdown */}
        <div style={{position:'relative'}}>
          <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'User'}</span>
              <span className="user-role">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
            </div>
          </div>

          {showUserMenu && (
            <div style={{
              position:'absolute', top:'100%', right:0, marginTop:'0.5rem',
              background:'var(--bg-card)', border:'1px solid var(--border-color)',
              borderRadius:'12px', padding:'0.75rem', minWidth:'220px',
              boxShadow:'var(--shadow-lg)', zIndex:200
            }}>
              {user?.phone && (
                <div style={{padding:'0.5rem 0.75rem',fontSize:'0.8rem',color:'var(--text-muted)',borderBottom:'1px solid var(--border-color)',marginBottom:'0.5rem'}}>
                  No. HP: <span style={{color:'var(--text-main)',fontWeight:500}}>{user.phone}</span>
                </div>
              )}
              <button
                onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }}
                style={{
                  display:'flex', alignItems:'center', gap:'0.75rem', width:'100%',
                  padding:'0.6rem 0.75rem', border:'none', background:'transparent',
                  color:'var(--text-main)', cursor:'pointer', borderRadius:'8px',
                  fontSize:'0.875rem', fontFamily:'inherit', textAlign:'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <Lock size={16} /> Ganti Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold">Ganti Password</h3>
              <button className="btn-icon" onClick={() => setShowPasswordModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body flex flex-col gap-4">
              {pwError && <div style={{background:'var(--danger-light)',color:'var(--danger)',padding:'0.5rem 1rem',borderRadius:'8px',fontSize:'0.875rem'}}>{pwError}</div>}
              {pwSuccess && <div style={{background:'var(--primary-light)',color:'var(--primary)',padding:'0.5rem 1rem',borderRadius:'8px',fontSize:'0.875rem'}}>{pwSuccess}</div>}
              <div className="form-group mb-0">
                <label className="form-label">Password Lama</label>
                <div style={{position:'relative'}}>
                  <input type={showPw.current ? 'text' : 'password'} className="form-input" style={{paddingRight:'2.5rem'}} placeholder="Masukkan password lama" value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} />
                  <button type="button" onClick={() => setShowPw({...showPw, current: !showPw.current})} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:'0.25rem',display:'flex'}}>
                    {showPw.current ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Password Baru</label>
                <div style={{position:'relative'}}>
                  <input type={showPw.new ? 'text' : 'password'} className="form-input" style={{paddingRight:'2.5rem'}} placeholder="Masukkan password baru" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} />
                  <button type="button" onClick={() => setShowPw({...showPw, new: !showPw.new})} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:'0.25rem',display:'flex'}}>
                    {showPw.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Konfirmasi Password Baru</label>
                <div style={{position:'relative'}}>
                  <input type={showPw.confirm ? 'text' : 'password'} className="form-input" style={{paddingRight:'2.5rem'}} placeholder="Ulangi password baru" value={pwForm.confirm_password} onChange={e => setPwForm({...pwForm, confirm_password: e.target.value})} />
                  <button type="button" onClick={() => setShowPw({...showPw, confirm: !showPw.confirm})} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:'0.25rem',display:'flex'}}>
                    {showPw.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwLoading}>
                {pwLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
