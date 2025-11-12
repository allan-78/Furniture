const Brand = require('../models/Brand');

// ============================================
// @desc    Get all brands (Public)
// @route   GET /api/brands
// @access  Public
// ============================================
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .select('name description logo website slug')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
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
// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
// ============================================
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let brand = await Brand.findById(id);

    if (!brand) {
      brand = await Brand.findOne({ slug: id });
    }

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
