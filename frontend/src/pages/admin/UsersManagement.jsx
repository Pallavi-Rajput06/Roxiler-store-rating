import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import UserDetailsModal from '../../components/UserDetailsModal';
import api from '../../config/api';
import { Users, UserPlus, Search, Filter, ArrowUpDown, Eye, Shield, AlertCircle } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form state for adding user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          search,
          role: roleFilter,
          sortBy,
          order: sortOrder
        }
      });
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to fetch users list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  // Validate form matching PDF requirements
  const validateNewUser = () => {
    const errs = {};
    if (!newUser.name.trim() || newUser.name.length < 20 || newUser.name.length > 60) {
      errs.name = `Name must be 20 to 60 characters (Current: ${newUser.name.length})`;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email.trim() || !emailRegex.test(newUser.email)) {
      errs.email = 'Valid email is required';
    }
    if (!newUser.address.trim() || newUser.address.length > 400) {
      errs.address = 'Address max 400 characters';
    }
    const hasUppercase = /[A-Z]/.test(newUser.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\+\=\[\]\/\\]/.test(newUser.password);
    if (!newUser.password || newUser.password.length < 8 || newUser.password.length > 16 || !hasUppercase || !hasSpecial) {
      errs.password = 'Password 8-16 chars with at least 1 uppercase and 1 special char';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateNewUser()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/admin/users', newUser);
      if (response.data.success) {
        setToast({ message: 'User added successfully!', type: 'success' });
        setIsAddModalOpen(false);
        setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
        fetchUsers();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create user', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const openUserDetails = (id) => {
    setSelectedUserId(id);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Users Directory</h1>
            <p className="page-subtitle">View, search, filter, and add system users (Admin, Store Owner, Normal User)</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by Name, Email, or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <Filter size={18} style={{ color: 'var(--color-text-muted)' }} />
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="NORMAL_USER">Normal User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <Loader message="Loading user directory..." />
        ) : users.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>No users match the search/filter criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange('name')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Name</span> <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th onClick={() => handleSortChange('email')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Email</span> <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th onClick={() => handleSortChange('address')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Address</span> <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th onClick={() => handleSortChange('role')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Role</span> <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.address}
                    </td>
                    <td>
                      <span className={`badge badge-${u.role === 'SYSTEM_ADMIN' ? 'admin' : u.role === 'STORE_OWNER' ? 'owner' : 'user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openUserDetails(u.id)}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Add New User */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User">
          <form onSubmit={handleAddUserSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name (Min 20, Max 60 chars)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Full Name minimum 20 characters..."
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                maxLength={60}
                required
              />
              {formErrors.name && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.name}</span></div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              {formErrors.email && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.email}</span></div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="SYSTEM_ADMIN">System Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address (Max 400 chars)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Full address details..."
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                maxLength={400}
                required
              />
              {formErrors.address && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.address}</span></div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password (8-16 chars, 1 uppercase, 1 special char)</label>
              <input
                type="password"
                className="form-input"
                placeholder="e.g. UserPass@123"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                maxLength={16}
                required
              />
              {formErrors.password && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.password}</span></div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: View Single User Details */}
        <UserDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          userId={selectedUserId}
        />
      </main>
    </div>
  );
};

export default UsersManagement;
