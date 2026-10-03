const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Normal User: View all stores with search, sorting, overall rating & user's submitted rating
const getAllStoresForUser = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { name, address, search, sortBy = 'name', order = 'ASC' } = req.query;

    let queryStr = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             ROUND(AVG(r.rating), 2) AS overall_rating,
             COUNT(r.id) AS total_ratings,
             ur.rating AS user_submitted_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [currentUserId];

    if (name) {
      queryStr += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (address) {
      queryStr += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    if (search) {
      queryStr += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryStr += ' GROUP BY s.id, ur.rating';

    const allowedSortColumns = {
      name: 's.name',
      address: 's.address',
      rating: 'overall_rating',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortColumns[sortBy.toLowerCase()] || 's.name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryStr += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [stores] = await pool.query(queryStr, params);

    const formattedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      overallRating: store.overall_rating ? parseFloat(store.overall_rating) : 0,
      totalRatings: store.total_ratings || 0,
      userSubmittedRating: store.user_submitted_rating ? parseInt(store.user_submitted_rating, 10) : null
    }));

    return sendSuccess(res, 200, 'Stores retrieved successfully', { stores: formattedStores });
  } catch (error) {
    console.error('Get stores for user error:', error);
    return sendError(res, 500, 'Failed to fetch stores.');
  }
};

// Store Owner Dashboard: View store average rating and list of users who submitted ratings
const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find store owned by this store owner
    const [stores] = await pool.query('SELECT id, name, email, address FROM stores WHERE owner_id = ?', [ownerId]);

    if (stores.length === 0) {
      return sendError(res, 404, 'No store is assigned to your Store Owner account.');
    }

    const store = stores[0];

    // Get average rating and total ratings count
    const [[avgResult]] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) AS averageRating, COUNT(id) AS totalRatings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    // Get list of users who submitted ratings for this store
    const [ratingsList] = await pool.query(
      `SELECT r.id AS rating_id, r.rating, r.created_at, r.updated_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email, u.address AS user_address
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    const formattedRatings = ratingsList.map(item => ({
      ratingId: item.rating_id,
      rating: item.rating,
      submittedAt: item.updated_at || item.created_at,
      user: {
        id: item.user_id,
        name: item.user_name,
        email: item.user_email,
        address: item.user_address
      }
    }));

    return sendSuccess(res, 200, 'Store owner dashboard retrieved successfully', {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: avgResult.averageRating ? parseFloat(avgResult.averageRating) : 0,
        totalRatings: avgResult.totalRatings || 0
      },
      ratings: formattedRatings
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    return sendError(res, 500, 'Failed to fetch store owner dashboard.');
  }
};

module.exports = {
  getAllStoresForUser,
  getStoreOwnerDashboard
};
