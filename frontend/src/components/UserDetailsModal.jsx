import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import Loader from './Loader';
import api from '../config/api';
import { User, Mail, MapPin, Shield, Store } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details">
      {loading ? (
        <Loader message="Loading user details..." />
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', padding: '1rem 0' }}>{error}</div>
      ) : user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem' }}>{user.name}</h4>
              <span className={`badge badge-${user.role === 'SYSTEM_ADMIN' ? 'admin' : user.role === 'STORE_OWNER' ? 'owner' : 'user'}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <Mail size={16} />
              <span>Email:</span>
              <strong style={{ color: 'var(--color-text-main)', marginLeft: 'auto' }}>{user.email}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <MapPin size={16} />
              <span>Address:</span>
              <strong style={{ color: 'var(--color-text-main)', marginLeft: 'auto', textAlign: 'right', maxWidth: '260px' }}>{user.address}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <Shield size={16} />
              <span>Registered On:</span>
              <strong style={{ color: 'var(--color-text-main)', marginLeft: 'auto' }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </strong>
            </div>
          </div>

          {/* Store Owner Specific Information (Store Average Rating) */}
          {user.role === 'STORE_OWNER' && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 600 }}>
                <Store size={18} />
                <span>Assigned Store Information</span>
              </div>
              {user.store ? (
                <div>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    Store Name: <strong>{user.store.name}</strong>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Store Rating:</span>
                    <StarRating rating={user.rating || 0} readOnly={true} size={18} />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  No store is currently assigned to this Store Owner.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default UserDetailsModal;
