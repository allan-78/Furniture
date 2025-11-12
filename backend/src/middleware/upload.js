const multer = require('multer');

// ============================================
// MULTER STORAGE CONFIGURATION
// ============================================
// Use memory storage - files stored as Buffer in memory
const storage = multer.memoryStorage();

// ============================================
// FILE FILTER
// ============================================
/**
 * Filter uploaded files to only allow images
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! (jpg, jpeg, png, gif, webp)'), false);
  }
};

// ============================================
// MULTER CONFIGURATION
// ============================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Max 10 files at once
  }
});

// ============================================
// UPLOAD HANDLERS
// ============================================

/**
 * Single image upload middleware
 * Field name: 'image'
 */
const uploadSingle = upload.single('image');

/**
 * Multiple image upload middleware (max 10)
 * Field name: 'images'
 */
const uploadMultiple = upload.array('images', 10);

/**
 * Multiple fields with different names
 * Example: logo, banner, gallery
 */
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]);

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
/**
 * Handle multer errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large! Maximum size is 5MB per file.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files! Maximum is 10 images.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "image" for single upload or "images" for multiple.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  
  // Other errors (e.g., file type errors)
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleMulterError
};
