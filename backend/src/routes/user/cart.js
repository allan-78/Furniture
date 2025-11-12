const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../../controllers/user/cartController');

const { protect } = require('../../middleware/auth');

// ============================================
// CART ROUTES (Protected - Customer)
// ============================================

// All routes require authentication
router.use(protect);

// Get cart and add item
router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// Update and remove cart item
router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
