const express = require('express');
const router = express.Router();
const {
  checkout,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  updatePaymentStatus,
  updateOrderStatus
} = require('../../controllers/user/orderController');

const { protect, authorize } = require('../../middleware/auth');

// ============================================
// ORDER ROUTES (Protected)
// ============================================

// All routes require authentication
router.use(protect);

// Checkout and get user orders
router.route('/')
  .post(checkout)
  .get(getUserOrders);

// Get order details
router.get('/:orderId', getOrderDetails);

// Cancel order
router.patch('/:orderId/cancel', cancelOrder);

// ============================================
// ADMIN ONLY - Update order/payment status
// ============================================
router.patch('/:orderId/payment', authorize('admin'), updatePaymentStatus);
router.patch('/:orderId/status', authorize('admin'), updateOrderStatus);

module.exports = router;
