const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByBrand,
  getFeaturedProducts,
  searchProducts
} = require('../controllers/productController');

// ============================================
// PUBLIC PRODUCT ROUTES (No Authentication)
// ============================================

// Search products (must come before /:id to avoid conflict)
router.get('/search', searchProducts);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Get products by category (must come before /:id)
router.get('/category/:categoryId', getProductsByCategory);

// Get products by brand (must come before /:id)
router.get('/brand/:brandId', getProductsByBrand);

// Get all products with filters
router.get('/', getAllProducts);

// Get single product by ID or slug
router.get('/:id', getProductById);

module.exports = router;
