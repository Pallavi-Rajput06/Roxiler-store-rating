const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getUserDetails,
  getStores
} = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const validate = require('../middleware/validate');
const { addUserByAdminValidation, addStoreValidation } = require('../utils/validators');

// All admin routes require SYSTEM_ADMIN role
router.use(authenticateToken, authorizeRoles('SYSTEM_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.post('/users', addUserByAdminValidation, validate, addUser);
router.post('/stores', addStoreValidation, validate, addStore);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.get('/stores', getStores);

module.exports = router;
