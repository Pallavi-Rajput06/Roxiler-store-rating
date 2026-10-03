import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import api from '../../config/api';
import { Store, PlusCircle, Search, ArrowUpDown, AlertCircle, UserCheck } from 'lucide-react';

const StoresManagement = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [search, sortBy, sortOrder]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stores', {
        params: {
          search,
          sortBy,
          order: sortOrder
        }
      });
      if (response.data.success) {
        setStores(response.data.data.stores);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to fetch stores list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await api.get('/admin/users', { params: { role: 'STORE_OWNER' } });
      if (response.data.success) {
        setStoreOwners(response.data.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch store owners list');
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

  const validateNewStore = () => {
    const errs = {};
    if (!newStore.name.trim() || newStore.name.length < 20 || newStore.name.length > 60) {
      errs.name = `Store Name must be between 20 and 60 characters (Current: ${newStore.name.length})`;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newStore.email.trim() || !emailRegex.test(newStore.email)) {
      errs.email = 'Valid store email is required';
    }
    if (!newStore.address.trim() || newStore.address.length > 400) {
      errs.address = 'Store Address max 400 characters';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    if (!validateNewStore()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        owner_id: newStore.owner_id ? parseInt(newStore.owner_id, 10) : null
      };

      const response = await api.post('/admin/stores', payload);
      if (response.data.success) {
        setToast({ message: 'Store created successfully!', type: 'success' });
        setIsAddModalOpen(false);
        setNewStore({ name: '', email: '', address: '', owner_id: '' });
        fetchStores();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create store', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Stores Management</h1>
            <p className="page-subtitle">View, search, filter, and add registered stores with overall ratings</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={18} />
            <span>Add New Store</span>
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by Store Name, Email, or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stores Table */}
        {loading ? (
          <Loader message="Loading registered stores..." />
        ) : stores.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Store size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>No stores match the search criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange('name')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Store Name</span> <ArrowUpDown size={14} />
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
                  <th onClick={() => handleSortChange('rating')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Overall Rating</span> <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th>Assigned Owner</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{s.email}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.address}
                    </td>
                    <td>
                      <StarRating rating={s.rating} readOnly={true} size={18} />
                    </td>
                    <td>
                      {s.owner ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <UserCheck size={14} style={{ color: '#34d399' }} />
                          <span>{s.owner.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', italic: 'true' }}>Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Add New Store */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Store">
          <form onSubmit={handleAddStoreSubmit}>
            <div className="form-group">
              <label className="form-label">Store Name (Min 20, Max 60 chars)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Store Name minimum 20 characters..."
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                maxLength={60}
                required
              />
              {formErrors.name && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.name}</span></div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Store Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="store@example.com"
                value={newStore.email}
                onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                required
              />
              {formErrors.email && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.email}</span></div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Store Address (Max 400 chars)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Complete store location address..."
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                maxLength={400}
                required
              />
              {formErrors.address && (
                <div className="form-error"><AlertCircle size={14} /><span>{formErrors.address}</span></div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Assign Store Owner (Optional)</label>
              <select
                className="form-select"
                value={newStore.owner_id}
                onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
              >
                <option value="">-- Select Store Owner (Optional) --</option>
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default StoresManagement;
