import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, LogIn, Eye, EyeOff, X, ArrowLeft } from 'lucide-react';
import MusicPlayer from '../components/UI/MusicPlayer';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error || 'Login gagal. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="login-container">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="glass-card login-card animate-fade-in">
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '1rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '8px',
            transition: 'all 0.2s',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="login-header">
          <div className="brand-logo-large">
            <span style={{fontSize:'40px',lineHeight:1}}>🇮🇩</span>
          </div>
          <h2>Selamat Datang</h2>
          <p className="text-muted">Masuk Ke Sistem E-Meli</p>
        </div>

        {error && (
          <div className="login-error animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group relative-input">
            <User size={18} className="input-icon" />
            <input
              type="text"
              className="form-input with-icon"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group relative-input">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input with-icon"
              style={{paddingRight:'2.5rem'}}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:'0.25rem',display:'flex',zIndex:1}}>
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Lupa Password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4 login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-xs text-muted">
            Dibuat dengan Sepenuh dan Ketulusan ❤️ Untuk Event Terbaik
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '350px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Lupa Password</h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '8px' }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Hubungi admin untuk reset password
                </p>
                <a
                  href="https://wa.me/6287883735333"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}
                >
                  087883735333
                </a>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
              Tekan nomor di atas untuk langsung chat via WhatsApp
            </p>
          </div>
        </div>
      )}
    </div>
    <MusicPlayer />
    </>
  );
};

export default LoginPage;
