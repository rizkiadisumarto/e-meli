import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Receipt, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ open, onClose }) => {
  const { pathname } = useLocation();
  const { logout, isAdmin } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Transaksi', path: '/transactions', icon: <Wallet size={20} /> },
    { name: 'Anggota', path: '/members', icon: <Users size={20} /> },
    { name: 'Iuran', path: '/dues', icon: <Receipt size={20} /> },
    { name: 'Kegiatan', path: '/events', icon: <Calendar size={20} /> },
    { name: 'Laporan', path: '/reports', icon: <BarChart3 size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Pengaturan', path: '/settings', icon: <Settings size={20} /> });
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Wallet size={24} className="text-primary" />
        </div>
        <h2>Kas Meli</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path)) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item btn-logout" onClick={logout}>
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
