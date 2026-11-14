import { useEffect, useState } from 'react';
import api from '../../services/api';

const emptyStats = { totalUsers: 0, totalDonations: 0, pendingRequests: 0, completedDonations: 0 };

function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      const [dashboardResponse, usersResponse] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/users')]);
      setStats(dashboardResponse.data.stats);
      setUsers(usersResponse.data.users);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load admin data.');
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  const updateUser = async (userId, action) => {
    try {
      await api.put(`/admin/users/${userId}/${action}`);
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this user.');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <section className="dashboard-hero admin-dashboard-hero">
          <div><span className="kicker">Platform control room</span><h1>Admin overview</h1><p>Keep GiveBridge trustworthy by monitoring activity and reviewing community accounts.</p></div>
          <div className="dashboard-hero-aside"><strong>Moderation at a glance</strong><span>Review new accounts and keep the platform ready for real giving.</span></div>
        </section>
        {error && <p className="error-message">{error}</p>}
        <div className="dashboard-stat-grid">
          <div className="dashboard-stat"><span>Total users</span><strong>{stats.totalUsers}</strong></div>
          <div className="dashboard-stat"><span>Total donations</span><strong>{stats.totalDonations}</strong></div>
          <div className="dashboard-stat"><span>Pending requests</span><strong>{stats.pendingRequests}</strong></div>
          <div className="dashboard-stat"><span>Completed donations</span><strong>{stats.completedDonations}</strong></div>
        </div>
        <div className="content-heading"><div><span className="kicker">Trust and safety</span><h2>User verification</h2></div><span className="muted-label">{users.length} accounts</span></div>
        <div className="admin-user-list">
          {users.length === 0 ? <div className="empty-state dashboard-card"><h3>No user records available</h3><p>Users will appear here after registration.</p></div> : users.map((user) => <article className="dashboard-card admin-user-row" key={user._id}><div><strong>{user.name}</strong><span>{user.email} · {user.role}</span></div><div className="admin-user-actions"><span className={`status-label ${user.verificationStatus === 'VERIFIED' ? 'verified' : ''}`}>{user.verificationStatus}</span>{user.role !== 'admin' && user.isActive && user.verificationStatus !== 'VERIFIED' && <button className="btn btn-light" type="button" onClick={() => updateUser(user._id, 'verify')}>Verify</button>}{user.role !== 'admin' && user.isActive && <button className="btn btn-secondary" type="button" onClick={() => updateUser(user._id, 'suspend')}>Suspend</button>}{user.role !== 'admin' && !user.isActive && <button className="btn btn-light" type="button" onClick={() => updateUser(user._id, 'reactivate')}>Reactivate</button>}</div></article>)}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
