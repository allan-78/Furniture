const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');

// ============================================
// @desc    Checkout - Create order from cart
// @route   POST /api/orders/checkout
// @access  Private
// ============================================
exports.checkout = async (req, res) => {
  try {
    const { shippingAddressId, paymentMethod } = req.body;

    if (!shippingAddressId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.product.name} is out of stock or insufficient quantity`
        });
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    const shipping = 100; // Fixed shipping for now
    const tax = Math.round(subtotal * 0.12); // 12% tax
    const total = subtotal + shipping + tax;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderNumber: `ORD-${Date.now()}`,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: shippingAddressId,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity, totalSales: item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order details
    await order.populate([
      { path: 'user', select: 'firstName lastName email phone' },
      { path: 'items.product', select: 'name price images slug' },
      { path: 'shippingAddress', select: 'fullName phone street city province zipCode' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============================================
// @desc    Get all user orders
// @route   GET /api/orders
// @access  Private
// ============================================
exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price images slug')
      .populate('shippingAddress', 'fullName city province')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============================================
// @desc    Get single order details
// @route   GET /api/orders/:orderId
// @access  Private
// ============================================
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user.id })
      .populate('items.product', 'name price images slug')
      .populate('shippingAddress')
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============================================
// @desc    Cancel order
// @route   PATCH /api/orders/:orderId/cancel
// @access  Private
// ============================================
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Can only cancel pending/confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { 
          $inc: { stock: item.quantity, totalSales: -item.quantity }
        }
      );
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============================================
// @desc    Update order payment status
// @route   PATCH /api/orders/:orderId/payment
// @access  Private (Admin only)
// ============================================
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    ).populate('items.product', 'name price')
     .populate('shippingAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============================================
// @desc    Update order status
// @route   PATCH /api/orders/:orderId/status
// @access  Private (Admin only)
// ============================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    ).populate('items.product', 'name price')
     .populate('shippingAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
