const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../../controllers/user/addressController');

const { protect } = require('../../middleware/auth');

// ============================================
// ADDRESS ROUTES (Protected)
// ============================================

// All routes require authentication
router.use(protect);

// Get all addresses and add new
router.route('/')
  .get(getAddresses)
  .post(addAddress);

// Update and delete address
router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

// Set default address
router.patch('/:id/default', setDefaultAddress);

module.exports = router;
