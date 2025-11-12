const Product = require('../../models/Product');
const { uploadMultipleToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinary');

// @desc    Get all products (Admin view)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/admin/products/:id
// @access  Private/Admin
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name image')
      .populate('brand', 'name logo');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create product with multiple images
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      sizes,
      colors,
      weight,
      certifications,
      features,
      specifications  // ADD THIS!
    } = req.body;

    // Upload multiple images
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleToCloudinary(req.files, 'aegisgear/products');
      images = uploadedImages;
    }

    // Parse JSON strings to arrays and objects
    const parsedSizes = sizes ? JSON.parse(sizes) : [];
    const parsedColors = colors ? JSON.parse(colors) : [];
    const parsedCertifications = certifications ? JSON.parse(certifications) : [];
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedSpecifications = specifications ? JSON.parse(specifications) : { helmetType: 'Full Face' };  // ADD THIS!

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      sizes: parsedSizes,
      colors: parsedColors,
      weight,
      certifications: parsedCertifications,
      features: parsedFeatures,
      specifications: parsedSpecifications  // ADD THIS!
    });

    // Populate references
    await product.populate('category brand');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      sizes,
      colors,
      weight,
      certifications,
      features,
      isActive
    } = req.body;

    // Update basic fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? stock : product.stock;
    product.weight = weight || product.weight;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    // Update arrays if provided
    if (sizes) product.sizes = JSON.parse(sizes);
    if (colors) product.colors = JSON.parse(colors);
    if (certifications) product.certifications = JSON.parse(certifications);
    if (features) product.features = JSON.parse(features);

    // Handle new images upload (append to existing)
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleToCloudinary(req.files, 'aegisgear/products');
      product.images = [...product.images, ...uploadedImages];
    }

    await product.save();
    await product.populate('category brand');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete single product image
// @route   DELETE /api/admin/products/:id/images/:publicId
// @access  Private/Admin
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { publicId } = req.params;

    // Find and remove image from array
    const imageExists = product.images.find(img => img.publicId === publicId);
    
    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    product.images = product.images.filter(img => img.publicId !== publicId);
    
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await deleteFromCloudinary(image.publicId);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/admin/products/:id/stock
// @access  Private/Admin
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stock number'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    ).populate('category brand');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
