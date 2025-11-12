const Category = require('../models/Category');

// ============================================
// @desc    Get all categories (Public)
// @route   GET /api/categories
// @access  Public
// ============================================
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name description image slug')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
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
// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
// ============================================
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let category = await Category.findById(id);

    if (!category) {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
