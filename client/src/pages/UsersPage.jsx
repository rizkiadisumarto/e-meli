import { useState, useEffect } from 'react';
import { Users, Shield, Eye, UserCheck } from 'lucide-react';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', icon: <Shield size={16} />, color: 'badge-warning', bgColor: 'var(--warning-light)' };
      case 'committee':
        return { label: 'Committee', icon: <UserCheck size={16} />, color: 'badge-success', bgColor: 'var(--primary-light)' };
      case 'user':
      case 'viewer':
      default:
        return { label: 'User', icon: <Eye size={16} />, color: 'badge-neutral', bgColor: 'rgba(255,255,255,0.05)' };
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  const admins = users.filter(u => u.role === 'admin');
  const committees = users.filter(u => u.role === 'committee');
  const regularUsers = users.filter(u => u.role === 'viewer' || u.role === 'user' || !u.role);

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <div>
          <h2>Daftar Pengguna</h2>
          <p className="text-muted text-sm mt-1">Lihat siapa saja yang menjadi admin, committee, dan user</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="glass-card" style={{borderLeft: '3px solid var(--warning)'}}>
          <div className="flex items-center gap-3">
            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'var(--warning-light)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--warning)'}}>
              <Shield size={20}/>
            </div>
            <div>
              <div className="text-sm text-muted">Administrator</div>
              <div className="text-2xl font-bold">{admins.length}</div>
            </div>
          </div>
        </div>
        <div className="glass-card" style={{borderLeft: '3px solid var(--primary)'}}>
          <div className="flex items-center gap-3">
            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--primary)'}}>
              <UserCheck size={20}/>
            </div>
            <div>
              <div className="text-sm text-muted">Committee</div>
              <div className="text-2xl font-bold">{committees.length}</div>
            </div>
          </div>
        </div>
        <div className="glass-card" style={{borderLeft: '3px solid var(--secondary)'}}>
          <div className="flex items-center gap-3">
            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--secondary)'}}>
              <Eye size={20}/>
            </div>
            <div>
              <div className="text-sm text-muted">User</div>
              <div className="text-2xl font-bold">{regularUsers.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List by Role */}
      {[
        { title: 'Administrator', icon: <Shield size={16} />, data: admins, color: 'var(--warning)' },
        { title: 'Committee', icon: <UserCheck size={16} />, data: committees, color: 'var(--primary)' },
        { title: 'User', icon: <Eye size={16} />, data: regularUsers, color: 'var(--secondary)' }
      ].map((section, idx) => (
        <div key={idx} className="glass-card mb-6">
          <h3 className="text-sm font-bold text-muted flex items-center gap-2 mb-4 uppercase">
            <span style={{color: section.color}}>{section.icon}</span> {section.title} ({section.data.length})
          </h3>
          {section.data.length > 0 ? (
            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th className="text-center">No</th>
                    <th>Nama Lengkap</th>
                    <th>Username</th>
                    <th>No. HP</th>
                    <th className="text-center">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((u, i) => {
                    const roleInfo = getRoleInfo(u.role);
                    return (
                      <tr key={u.id}>
                        <td className="text-center">{i + 1}</td>
                        <td className="font-medium">{u.full_name}</td>
                        <td className="text-muted">{u.username}</td>
                        <td>{u.phone || '-'}</td>
                        <td className="text-center">
                          <span className={`badge ${roleInfo.color}`}>
                            {roleInfo.icon} <span style={{marginLeft:'0.25rem'}}>{roleInfo.label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted text-sm">Tidak ada pengguna dengan role ini</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UsersPage;
