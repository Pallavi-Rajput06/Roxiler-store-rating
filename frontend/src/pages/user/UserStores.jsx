import React, { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import api from '../../config/api';
import { Store, Search, Filter, ArrowUpDown, Edit3, Star, MapPin, Mail, CheckCircle2 } from 'lucide-react';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Search & Sorting controls
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stores', {
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
      setToast({ message: err.response?.data?.message || 'Failed to fetch stores', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    // If user already submitted a rating, default to their existing rating, else 5
    setSelectedRating(store.userSubmittedRating || 5);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);
    try {
      const isModify = !!selectedStore.userSubmittedRating;
      const method = isModify ? 'put' : 'post';
      const endpoint = `/stores/${selectedStore.id}/rating`;

      const response = await api[method](endpoint, { rating: selectedRating });

      if (response.data.success) {
        setToast({
          message: isModify ? 'Rating modified successfully!' : 'Rating submitted successfully!',
          type: 'success'
        });
        setRatingModalOpen(false);
        fetchStores(); // Refresh ratings list
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit rating', type: 'error' });
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="content-area">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Explore & Rate Registered Stores</h1>
        <p className="page-subtitle">
          Search registered stores by Store Name or Address, view overall community ratings, and submit or modify your 1-5 star ratings
        </p>
      </div>

      {/* Search and Sort Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by Name or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
          <ArrowUpDown size={18} style={{ color: 'var(--color-text-muted)' }} />
          <select
            className="form-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sBy, sOrd] = e.target.value.split('-');
              setSortBy(sBy);
              setSortOrder(sOrd);
            }}
          >
            <option value="name-ASC">Store Name (A-Z)</option>
            <option value="name-DESC">Store Name (Z-A)</option>
            <option value="rating-DESC">Highest Overall Rating</option>
            <option value="rating-ASC">Lowest Overall Rating</option>
            <option value="address-ASC">Address (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Stores List Grid */}
      {loading ? (
        <Loader message="Loading registered stores..." />
      ) : stores.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Store size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Stores Found</h3>
          <p>No stores match your search query. Try searching with a different term.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {stores.map((store) => {
            const hasUserRated = store.userSubmittedRating !== null && store.userSubmittedRating !== undefined;

            return (
              <div key={store.id} className="glass-card" style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', lineHeight: 1.3 }}>{store.name}</h3>
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#fbbf24',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      <Star size={14} style={{ fill: '#fbbf24' }} />
                      <span>{store.overallRating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                      <span>{store.address}</span>
                    </div>
                    {store.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={16} style={{ flexShrink: 0, color: 'var(--color-secondary)' }} />
                        <span>{store.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Status Section */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-dim)', marginBottom: '0.25rem' }}>
                      Your Submitted Rating
                    </div>
                    {hasUserRated ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <StarRating rating={store.userSubmittedRating} readOnly={true} size={16} showValue={false} />
                        <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.95rem' }}>
                          {store.userSubmittedRating} / 5
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Not rated yet
                      </span>
                    )}
                  </div>

                  <button
                    className={`btn ${hasUserRated ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    onClick={() => openRatingModal(store)}
                  >
                    {hasUserRated ? (
                      <>
                        <Edit3 size={14} />
                        <span>Modify Rating</span>
                      </>
                    ) : (
                      <>
                        <Star size={14} />
                        <span>Submit Rating</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Submit / Modify Modal */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title={selectedStore?.userSubmittedRating ? `Modify Rating for ${selectedStore?.name}` : `Submit Rating for ${selectedStore?.name}`}
      >
        {selectedStore && (
          <form onSubmit={handleRatingSubmit}>
            <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem 0' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Select your rating from 1 to 5 stars for <strong>{selectedStore.name}</strong>
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <StarRating
                  rating={selectedRating}
                  onRate={(val) => setSelectedRating(val)}
                  readOnly={false}
                  size={36}
                  showValue={false}
                />
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
                {selectedRating} out of 5 Stars
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRatingModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingRating}>
                {submittingRating ? 'Saving...' : selectedStore.userSubmittedRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserStores;
