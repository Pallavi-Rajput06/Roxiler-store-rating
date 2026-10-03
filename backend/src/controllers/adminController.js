const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [[userCountResult]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[storeCountResult]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[ratingCountResult]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', {
      totalUsers: userCountResult.totalUsers || 0,
      totalStores: storeCountResult.totalStores || 0,
      totalRatings: ratingCountResult.totalRatings || 0
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return sendError(res, 500, 'Failed to fetch dashboard statistics.');
  }
};

// Add new user by admin
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return sendError(res, 400, 'User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    const createdUser = {
      id: result.insertId,
      name,
      email,
      address,
      role
    };

    return sendSuccess(res, 201, 'User created successfully', { user: createdUser });
  } catch (error) {
    console.error('Admin add user error:', error);
    return sendError(res, 500, 'Failed to create user.');
  }
};

// Add new store by admin
const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // If owner_id is provided, verify user exists
    if (owner_id) {
      const [ownerCheck] = await pool.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
      if (ownerCheck.length === 0) {
        return sendError(res, 400, 'Assigned Store Owner user ID does not exist.');
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    const createdStore = {
      id: result.insertId,
      name,
      email,
      address,
      owner_id: owner_id || null
    };

    return sendSuccess(res, 201, 'Store created successfully', { store: createdStore });
  } catch (error) {
    console.error('Admin add store error:', error);
    return sendError(res, 500, 'Failed to create store.');
  }
};

// View list of normal and admin users (or all users) with filtering and sorting
const getUsers = async (req, res) => {
  try {
    const { search, name, email, address, role, sortBy = 'created_at', order = 'DESC' } = req.query;

    let queryStr = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             ROUND(AVG(r.rating), 2) AS store_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Filters
    if (role) {
      queryStr += ' AND u.role = ?';
      params.push(role);
    }

    if (name) {
      queryStr += ' AND u.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (email) {
      queryStr += ' AND u.email LIKE ?';
      params.push(`%${email}%`);
    }

    if (address) {
      queryStr += ' AND u.address LIKE ?';
      params.push(`%${address}%`);
    }

    if (search) {
      queryStr += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    queryStr += ' GROUP BY u.id';

    // Allowed sort columns
    const allowedSortColumns = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
      rating: 'store_rating'
    };

    const sortColumn = allowedSortColumns[sortBy.toLowerCase()] || 'u.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryStr += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [users] = await pool.query(queryStr, params);

    // Format output: if role is STORE_OWNER include rating key
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
      rating: user.role === 'STORE_OWNER' ? (user.store_rating ? parseFloat(user.store_rating) : 0) : null
    }));

    return sendSuccess(res, 200, 'Users retrieved successfully', { users: formattedUsers });
  } catch (error) {
    console.error('Admin get users error:', error);
    return sendError(res, 500, 'Failed to fetch users.');
  }
};

// View single user details
const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              s.id AS store_id, s.name AS store_name,
              ROUND(AVG(r.rating), 2) AS store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = ?
       GROUP BY u.id, s.id`,
      [userId]
    );

    if (rows.length === 0) {
      return sendError(res, 404, 'User not found.');
    }

    const user = rows[0];
    const userDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at
    };

    if (user.role === 'STORE_OWNER') {
      userDetail.store = user.store_id ? {
        id: user.store_id,
        name: user.store_name
      } : null;
      userDetail.rating = user.store_rating ? parseFloat(user.store_rating) : 0;
    }

    return sendSuccess(res, 200, 'User details retrieved successfully', { user: userDetail });
  } catch (error) {
    console.error('Admin get user details error:', error);
    return sendError(res, 500, 'Failed to fetch user details.');
  }
};

// View list of stores with filtering and sorting
const getStores = async (req, res) => {
  try {
    const { name, email, address, search, sortBy = 'created_at', order = 'DESC' } = req.query;

    let queryStr = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             u.name AS owner_name, u.email AS owner_email,
             ROUND(AVG(r.rating), 2) AS rating,
             COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      queryStr += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (email) {
      queryStr += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }

    if (address) {
      queryStr += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    if (search) {
      queryStr += ' AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    queryStr += ' GROUP BY s.id, u.id';

    const allowedSortColumns = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortColumns[sortBy.toLowerCase()] || 's.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryStr += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [stores] = await pool.query(queryStr, params);

    const formattedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      rating: store.rating ? parseFloat(store.rating) : 0,
      total_ratings: store.total_ratings || 0,
      owner: store.owner_id ? {
        id: store.owner_id,
        name: store.owner_name,
        email: store.owner_email
      } : null,
      created_at: store.created_at
    }));

    return sendSuccess(res, 200, 'Stores retrieved successfully', { stores: formattedStores });
  } catch (error) {
    console.error('Admin get stores error:', error);
    return sendError(res, 500, 'Failed to fetch stores.');
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getUserDetails,
  getStores
};
