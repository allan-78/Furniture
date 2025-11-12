const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../../controllers/user/userController');

const { protect } = require('../../middleware/auth');

// ============================================
// USER PROFILE ROUTES (Protected)
// ============================================

// All routes require authentication
router.use(protect);

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Password change
router.put('/password', changePassword);

// Delete account
router.delete('/account', deleteAccount);

module.exports = router;
