import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Lock, Mail, Store, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

const Login = () => {
  const { login, getDashboardPathForRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ message: '', type: '' });

    if (!email || !password) {
      setToast({ message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      const targetPath = getDashboardPathForRole(user.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setToast({ message: err.message || 'Login failed. Please check credentials.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluation convenience
  const fillTestCredentials = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Store size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Single login portal for all platform roles
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-box" style={{ width: '100%' }}>
              <Mail className="search-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-box" style={{ width: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)'
        }}>
          Normal user? <Link to="/signup" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>

        {/* Evaluation Quick Credentials Panel */}
        <div style={{
          marginTop: '1.75rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--color-border)'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>
            ⚡ Demo Quick Autofill (Test Accounts)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillTestCredentials('admin@roxiler.com', 'AdminPass@123')}
              style={{ fontSize: '0.725rem', padding: '0.3rem 0.4rem' }}
            >
              <ShieldCheck size={12} /> Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillTestCredentials('owner@roxiler.com', 'OwnerPass@123')}
              style={{ fontSize: '0.725rem', padding: '0.3rem 0.4rem' }}
            >
              <Briefcase size={12} /> Owner
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillTestCredentials('user1@roxiler.com', 'UserPass@1234')}
              style={{ fontSize: '0.725rem', padding: '0.3rem 0.4rem' }}
            >
              <UserCheck size={12} /> User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
