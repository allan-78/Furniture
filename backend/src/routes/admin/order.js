const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderStats,
  updateOrder
} = require('../../controllers/admin/orderController');

const { protect, authorize } = require('../../middleware/auth');

// ============================================
// ADMIN ORDER ROUTES
// ============================================

// Protect all routes
router.use(protect, authorize('admin'));

// Get all orders and stats
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);

// Update order
router.patch('/:orderId', updateOrder);

module.exports = router;
