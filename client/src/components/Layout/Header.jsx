import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth();

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

        <button className="btn-icon">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.full_name || 'User'}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Viewer'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
