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
  UserCheck
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ open, onClose }) => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: <LayoutDashboard size={20} /> },
    { name: 'Transaksi', path: '/app/transactions', icon: <Wallet size={20} /> },
    { name: 'Anggota', path: '/app/members', icon: <Users size={20} /> },
    { name: 'Iuran', path: '/app/dues', icon: <Receipt size={20} /> },
    { name: 'Kegiatan', path: '/app/events', icon: <Calendar size={20} /> },
    { name: 'Laporan', path: '/app/reports', icon: <BarChart3 size={20} /> },
    { name: 'Pengguna', path: '/app/users', icon: <UserCheck size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Pengaturan', path: '/app/settings', icon: <Settings size={20} /> });
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Wallet size={24} className="text-primary" />
        </div>
        <h2>E-Meli</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${pathname === item.path || (item.path !== '/app' && pathname.startsWith(item.path)) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
