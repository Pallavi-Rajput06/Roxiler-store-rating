const express = require('express');
const router = express.Router();
const { signup, login, changePassword, getMe, logout } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupValidation, loginValidation, changePasswordValidation } = require('../utils/validators');

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/logout', logout);

// Protected routes
router.put('/change-password', authenticateToken, changePasswordValidation, validate, changePassword);
router.get('/me', authenticateToken, getMe);

module.exports = router;
