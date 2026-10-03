const express = require('express');
const router = express.Router();
const { getAllStoresForUser } = require('../controllers/storeController');
const { submitOrUpdateRating, modifyRating } = require('../controllers/ratingController');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const validate = require('../middleware/validate');
const { submitRatingValidation } = require('../utils/validators');

// Optional auth wrapper middleware so unauthenticated users can view stores, but authenticated users see their rating
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
};

// View registered stores (search & sort)
router.get('/', optionalAuth, getAllStoresForUser);

// Submit rating for a store (Normal User only)
router.post(
  '/:id/rating',
  authenticateToken,
  authorizeRoles('NORMAL_USER'),
  submitRatingValidation,
  validate,
  submitOrUpdateRating
);

// Modify rating for a store (Normal User only)
router.put(
  '/:id/rating',
  authenticateToken,
  authorizeRoles('NORMAL_USER'),
  submitRatingValidation,
  validate,
  modifyRating
);

module.exports = router;
