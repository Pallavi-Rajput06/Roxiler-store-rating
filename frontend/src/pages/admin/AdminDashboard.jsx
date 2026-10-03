import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import api from '../../config/api';
import { Users, Store, Star, UserPlus, PlusCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to load dashboard statistics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">System Administrator Dashboard</h1>
          <p className="page-subtitle">Real-time platform overview and quick management actions</p>
        </div>

        {loading ? (
          <Loader message="Fetching system analytics..." />
        ) : (
          <>
            {/* Assessment Required 3 Stat Cards */}
            <div className="stats-grid">
              {/* Stat 1: Total Users */}
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <Users size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users Registered</div>
                </div>
              </div>

              {/* Stat 2: Total Stores */}
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                  <Store size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.totalStores}</div>
                  <div className="stat-label">Total Stores Registered</div>
                </div>
              </div>

              {/* Stat 3: Total Submitted Ratings */}
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Star size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.totalRatings}</div>
                  <div className="stat-label">Total Submitted Ratings</div>
                </div>
              </div>
            </div>

            {/* Quick Management Banner */}
            <div className="glass-card" style={{ padding: '2rem', marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Quick Administrator Actions</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Add new stores or manage system user accounts across all platform roles
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/admin/users" className="btn btn-primary">
                  <UserPlus size={18} />
                  <span>Manage / Add Users</span>
                </Link>

                <Link to="/admin/stores" className="btn btn-secondary">
                  <PlusCircle size={18} />
                  <span>Manage / Add Stores</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
