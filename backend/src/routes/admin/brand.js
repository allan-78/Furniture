const express = require('express');
const router = express.Router();
const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../../controllers/admin/brandController');

const { protect, authorize } = require('../../middleware/auth');
const { uploadSingle, handleMulterError } = require('../../middleware/upload');

// Protect all routes and authorize admin only
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Routes
router.route('/')
  .get(getAllBrands)
  .post(uploadSingle, handleMulterError, createBrand);

router.route('/:id')
  .get(getBrandById)
  .put(uploadSingle, handleMulterError, updateBrand)
  .delete(deleteBrand);

module.exports = router;
