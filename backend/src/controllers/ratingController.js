const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Submit rating for a store (1 to 5)
const submitOrUpdateRating = async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    // Verify store exists
    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return sendError(res, 404, 'Store not found.');
    }

    // Check if rating already exists for this user and store
    const [existingRatings] = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let isNew = false;
    if (existingRatings.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, existingRatings[0].id]
      );
    } else {
      // Insert new rating
      isNew = true;
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }

    // Fetch updated store average rating
    const [[avgResult]] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) AS overallRating FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return sendSuccess(
      res,
      isNew ? 201 : 200,
      isNew ? 'Rating submitted successfully.' : 'Rating updated successfully.',
      {
        storeId: parseInt(storeId, 10),
        userSubmittedRating: parseInt(rating, 10),
        overallRating: avgResult.overallRating ? parseFloat(avgResult.overallRating) : 0
      }
    );
  } catch (error) {
    console.error('Submit/update rating error:', error);
    return sendError(res, 500, 'Failed to submit rating.');
  }
};

// Modify rating (PUT explicit endpoint)
const modifyRating = async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    // Verify user has already submitted a rating for this store
    const [existingRatings] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRatings.length === 0) {
      return sendError(res, 404, 'No previous rating found for this store to modify.');
    }

    await pool.query(
      'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [rating, existingRatings[0].id]
    );

    const [[avgResult]] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) AS overallRating FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return sendSuccess(res, 200, 'Rating modified successfully.', {
      storeId: parseInt(storeId, 10),
      userSubmittedRating: parseInt(rating, 10),
      overallRating: avgResult.overallRating ? parseFloat(avgResult.overallRating) : 0
    });
  } catch (error) {
    console.error('Modify rating error:', error);
    return sendError(res, 500, 'Failed to modify rating.');
  }
};

module.exports = {
  submitOrUpdateRating,
  modifyRating
};
