const express = require('express');
const router = express.Router();
const {
  getAllBrands,
  getBrandById
} = require('../controllers/brandController');

// ============================================
// PUBLIC BRAND ROUTES (No Authentication)
// ============================================

// Get all brands
router.get('/', getAllBrands);

// Get single brand
router.get('/:id', getBrandById);

module.exports = router;
