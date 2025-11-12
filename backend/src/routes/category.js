const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById
} = require('../controllers/categoryController');

// ============================================
// PUBLIC CATEGORY ROUTES (No Authentication)
// ============================================

// Get all categories
router.get('/', getAllCategories);

// Get single category
router.get('/:id', getCategoryById);

module.exports = router;
