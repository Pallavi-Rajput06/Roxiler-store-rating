import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { User, Mail, MapPin, Lock, AlertCircle, UserPlus } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Client side validation matching PDF assessment specifications exactly
  const validateForm = () => {
    const newErrors = {};

    // Name: Min 20 characters, Max 60 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 20 || formData.name.length > 60) {
      newErrors.name = `Name must be between 20 and 60 characters (Current length: ${formData.name.length})`;
    }

    // Email standard rules
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Must follow standard email validation rules';
    }

    // Address: Max 400 characters
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      newErrors.address = `Address cannot exceed 400 characters (Current length: ${formData.address.length})`;
    }

    // Password: 8-16 characters, must include at least 1 uppercase and 1 special character
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\+\=\[\]\/\\]/.test(formData.password);

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters';
    } else if (!hasUppercase) {
      newErrors.password = 'Password must include at least one uppercase letter (A-Z)';
    } else if (!hasSpecial) {
      newErrors.password = 'Password must include at least one special character (!@#$%^&*)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ message: '', type: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      navigate('/user/stores', { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 400
          ? 'Email is already registered.'
          : 'Registration failed. Please try again.');
    
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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

      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem' }}>
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
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Normal User Signup</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Register on the platform to rate stores
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">Full Name (Min 20, Max 60 chars)</label>
            <div className="search-box" style={{ width: '100%' }}>
              <User className="search-icon" size={18} />
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Johnathan Doe Sample User"
                value={formData.name}
                onChange={handleChange}
                maxLength={60}
                required
              />
            </div>
            {errors.name && (
              <div className="form-error">
                <AlertCircle size={14} /> <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-box" style={{ width: '100%' }}>
              <Mail className="search-icon" size={18} />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={14} /> <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Address Field */}
          <div className="form-group">
            <label className="form-label">Address (Max 400 chars)</label>
            <div className="search-box" style={{ width: '100%' }}>
              <MapPin className="search-icon" size={18} />
              <textarea
                name="address"
                className="form-textarea"
                rows="2"
                placeholder="123 Residential Street, Apartment 4B, City, Country"
                value={formData.address}
                onChange={handleChange}
                maxLength={400}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            {errors.address && (
              <div className="form-error">
                <AlertCircle size={14} /> <span>{errors.address}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password (8-16 chars, 1 uppercase, 1 special char)</label>
            <div className="search-box" style={{ width: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="e.g. UserPass@123"
                value={formData.password}
                onChange={handleChange}
                maxLength={16}
                required
              />
            </div>
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={14} /> <span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
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
          Already registered? <Link to="/login" style={{ fontWeight: 600 }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
