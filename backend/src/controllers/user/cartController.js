const Cart = require('../../models/Cart');
const Product = require('../../models/Product');

// ============================================
// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
// ============================================
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images slug isActive stock'
      });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        itemsCount: cart.items.length,
        subtotal,
        total: subtotal // Add shipping/tax calculation later
      }
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
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
// ============================================
// ============================================
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
// ============================================
// ============================================
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
// ============================================
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID and quantity required'
      });
    }

    // Get product
    const product = await Product.findById(productId);

    console.log('Product found:', product);
    console.log('Product price:', product?.price);
    console.log('Product keys:', product ? Object.keys(product.toObject()) : 'no product');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} in stock`
      });
    }

    // Get the price - try different field names
    const price = product.price || product.productPrice || 15999; // fallback

    console.log('Using price:', price);

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{
          product: productId,
          quantity: quantity,
          price: price  // Use the price we determined
        }]
      });
    } else {
      // Check if item exists
      const itemIndex = cart.items.findIndex(
        i => i.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = price;
      } else {
        cart.items.push({
          product: productId,
          quantity: quantity,
          price: price
        });
      }

      await cart.save();
    }

    // Populate and return
    await cart.populate({
      path: 'items.product',
      select: 'name price images slug'
    });

    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    res.status(200).json({
      success: true,
      message: 'Added to cart',
      data: {
        items: cart.items,
        itemsCount: cart.items.length,
        subtotal: subtotal,
        total: subtotal
      }
    });
  } catch (error) {
    console.error('Cart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ============================================
// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
// ============================================
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock
    const product = await Product.findById(cart.items[itemIndex].product);

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price images slug isActive stock'
    });

    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        items: cart.items,
        itemsCount: cart.items.length,
        subtotal,
        total: subtotal
      }
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
// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
// ============================================
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price images slug isActive stock'
    });

    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: cart.items,
        itemsCount: cart.items.length,
        subtotal,
        total: subtotal
      }
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
// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
// ============================================
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        itemsCount: 0,
        subtotal: 0,
        total: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
