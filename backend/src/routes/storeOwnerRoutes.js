const express = require('express');
const router = express.Router();
const { getStoreOwnerDashboard } = require('../controllers/storeController');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// All store owner routes require STORE_OWNER role
router.use(authenticateToken, authorizeRoles('STORE_OWNER'));

router.get('/dashboard', getStoreOwnerDashboard);

module.exports = router;
