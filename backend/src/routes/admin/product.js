const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  updateStock
} = require('../../controllers/admin/productController');

const { protect, authorize } = require('../../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../../middleware/upload');

// Protect all routes and authorize admin only
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Main product routes
router.route('/')
  .get(getAllProducts)
  .post(uploadMultiple, handleMulterError, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(uploadMultiple, handleMulterError, updateProduct)
  .delete(deleteProduct);

// Additional product routes
router.patch('/:id/stock', updateStock);
router.delete('/:id/images/:publicId', deleteProductImage);

module.exports = router;
