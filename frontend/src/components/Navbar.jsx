import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, Key, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN': return 'badge-admin';
      case 'STORE_OWNER': return 'badge-owner';
      case 'NORMAL_USER': default: return 'badge-user';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN': return 'Administrator';
      case 'STORE_OWNER': return 'Store Owner';
      case 'NORMAL_USER': default: return 'Normal User';
    }
  };

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Store size={22} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.02em'
            }}>
              Roxiler<span style={{ color: 'var(--color-primary)' }}>Rating</span>
            </span>
          </div>
        </Link>

        {/* User Info & Quick Actions */}
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{user.name}</span>
                <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                  {formatRoleName(user.role)}
                </span>
              </div>
              <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{user.email}</span>
            </div>

            <Link
              to="/change-password"
              className="btn btn-secondary btn-sm"
              title="Change Password"
            >
              <Key size={14} />
              <span>Password</span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
              title="Log Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
