import React, { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import StarRating from '../../components/StarRating';
import api from '../../config/api';
import { Store, Star, Users, MapPin, Mail, Calendar } from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  const fetchOwnerDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/store-owner/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to load store owner dashboard', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Store Owner Dashboard</h1>
        <p className="page-subtitle">Monitor your store's average rating and review customer feedback</p>
      </div>

      {loading ? (
        <Loader message="Loading store owner analytics..." />
      ) : !dashboardData || !dashboardData.store ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Store size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No Store Assigned</h3>
          <p>No registered store is currently linked to your Store Owner account.</p>
        </div>
      ) : (
        <>
          {/* Top Store Overview & Average Rating Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Card 1: Store Overview */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#22d3ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Store size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{dashboardData.store.name}</h3>
                  <span className="badge badge-owner">Assigned Store</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>{dashboardData.store.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} style={{ color: 'var(--color-secondary)' }} />
                  <span>{dashboardData.store.email}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Average Rating Statistics */}
            <div className="glass-card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Star size={28} style={{ fill: '#fbbf24' }} />
                </div>
                <div>
                  <div className="stat-value">{dashboardData.store.averageRating.toFixed(2)}</div>
                  <div className="stat-label">Store Average Rating</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StarRating rating={dashboardData.store.averageRating} readOnly={true} size={20} showValue={false} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                  Based on <strong>{dashboardData.store.totalRatings}</strong> customer rating{dashboardData.store.totalRatings === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Ratings Table */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Users size={22} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Customers Who Submitted Ratings</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Complete list of users who reviewed your store
                </p>
              </div>
            </div>

            {dashboardData.ratings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                <Star size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No customer ratings have been submitted for your store yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>User Rating</th>
                      <th>Submission Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ratings.map((item) => (
                      <tr key={item.ratingId}>
                        <td style={{ fontWeight: 600 }}>{item.user.name}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{item.user.email}</td>
                        <td>
                          <StarRating rating={item.rating} readOnly={true} size={16} />
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} />
                            <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
