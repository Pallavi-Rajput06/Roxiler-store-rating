const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'roxiler_store_rating_secret_key_jwt_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Normal user registration
const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user with email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return sendError(res, 400, 'User with this email address already exists.');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into DB with role = NORMAL_USER
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, 'NORMAL_USER']
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      address,
      role: 'NORMAL_USER'
    };

    const token = generateToken(newUser);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return sendError(res, 500, 'Failed to register user.');
  }
};

// Login for all roles
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, address, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Prepare user object without password
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    const token = generateToken(userProfile);

    return sendSuccess(res, 200, 'Login successful', {
      user: userProfile,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed.');
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Fetch stored user password
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return sendError(res, 404, 'User not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    return sendSuccess(res, 200, 'Password updated successfully.');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 500, 'Failed to update password.');
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'User profile retrieved', { user: req.user });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch user profile.');
  }
};

// Logout API endpoint
const logout = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'Logout successful. Client token cleared.');
  } catch (error) {
    return sendError(res, 500, 'Logout failed.');
  }
};

module.exports = {
  signup,
  login,
  changePassword,
  getMe,
  logout
};
