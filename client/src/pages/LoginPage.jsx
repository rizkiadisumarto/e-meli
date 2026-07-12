import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, LogIn, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login gagal. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="glass-card login-card animate-fade-in">
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
    </div>
  );
};

export default LoginPage;
