const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/admin/categoryController');

const { protect, authorize } = require('../../middleware/auth');
const { uploadSingle, handleMulterError } = require('../../middleware/upload');

// Protect all routes and authorize admin only
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Routes
router.route('/')
  .get(getAllCategories)
  .post(uploadSingle, handleMulterError, createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(uploadSingle, handleMulterError, updateCategory)
  .delete(deleteCategory);

module.exports = router;
