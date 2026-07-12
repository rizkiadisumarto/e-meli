import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MusicPlayer from '../UI/MusicPlayer';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
            <Menu size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <Header />
          </div>
        </div>
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Layout;
