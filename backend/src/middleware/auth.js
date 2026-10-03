const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendError } = require('../utils/responseHandler');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendError(res, 401, 'Access denied. No authentication token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'roxiler_store_rating_secret_key_jwt_2026');
    
    // Fetch user from database to ensure user still exists and hasn't been deleted
    const [rows] = await pool.query(
      'SELECT id, name, email, role, address FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return sendError(res, 401, 'Invalid authentication token or user no longer exists.');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

module.exports = authenticateToken;
