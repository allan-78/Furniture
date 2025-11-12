const Address = require('../../models/Address');

// ============================================
// @desc    Get all user addresses
// @route   GET /api/user/addresses
// @access  Private
// ============================================
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
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
// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
// ============================================
exports.addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      street,
      barangay,
      city,
      province,
      zipCode,
      isDefault
    } = req.body;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      user: req.user.id,
      fullName,
      phone,
      street,
      barangay,
      city,
      province,
      zipCode,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
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
// @desc    Update address
// @route   PUT /api/user/addresses/:id
// @access  Private
// ============================================
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      street,
      barangay,
      city,
      province,
      zipCode,
      isDefault
    } = req.body;

    let address = await Address.findOne({ _id: id, user: req.user.id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update fields
    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.barangay = barangay || address.barangay;
    address.city = city || address.city;
    address.province = province || address.province;
    address.zipCode = zipCode || address.zipCode;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
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
// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
// @access  Private
// ============================================
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, user: req.user.id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
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
// @desc    Set default address
// @route   PATCH /api/user/addresses/:id/default
// @access  Private
// ============================================
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, user: req.user.id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all other defaults
    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: address
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
