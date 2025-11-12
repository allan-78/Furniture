const Brand = require('../../models/Brand');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinary');

// @desc    Get all brands
// @route   GET /api/admin/brands
// @access  Private/Admin
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });

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

// @desc    Get single brand
// @route   GET /api/admin/brands/:id
// @access  Private/Admin
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

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

// @desc    Create brand
// @route   POST /api/admin/brands
// @access  Private/Admin
exports.createBrand = async (req, res) => {
  try {
    const { name, description, website } = req.body;

    // Check if brand exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Brand already exists'
      });
    }

    // Upload logo if provided
    let logoUrl = '';
    let logoPublicId = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'aegisgear/brands');
      logoUrl = result.url;
      logoPublicId = result.publicId;
    }

    // Create brand
    const brand = await Brand.create({
      name,
      description,
      logo: logoUrl,
      logoPublicId,
      website
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
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

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private/Admin
exports.updateBrand = async (req, res) => {
  try {
    const { name, description, website } = req.body;
    
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Update fields
    brand.name = name || brand.name;
    brand.description = description || brand.description;
    brand.website = website || brand.website;

    // Update logo if new file uploaded
    if (req.file) {
      // Delete old logo
      if (brand.logoPublicId) {
        await deleteFromCloudinary(brand.logoPublicId);
      }

      // Upload new logo
      const result = await uploadToCloudinary(req.file, 'aegisgear/brands');
      brand.logo = result.url;
      brand.logoPublicId = result.publicId;
    }

    await brand.save();

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
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

// @desc    Delete brand
// @route   DELETE /api/admin/brands/:id
// @access  Private/Admin
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Delete logo from Cloudinary
    if (brand.logoPublicId) {
      await deleteFromCloudinary(brand.logoPublicId);
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
