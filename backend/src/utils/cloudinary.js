const cloudinary = require('cloudinary').v2;
const DatauriParser = require('datauri/parser');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Convert buffer to data URI
const parser = new DatauriParser();

const formatBufferTo64 = (file) => {
  return parser.format(path.extname(file.originalname).toString(), file.buffer);
};

// Upload single image
const uploadToCloudinary = async (file, folder = 'aegisgear') => {
  try {
    const file64 = formatBufferTo64(file);
    const result = await cloudinary.uploader.upload(file64.content, {
      folder: folder,
      resource_type: 'auto'
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

// Upload multiple images
const uploadMultipleToCloudinary = async (files, folder = 'aegisgear/products') => {
  try {
    const uploadPromises = files.map(file => {
      const file64 = formatBufferTo64(file);
      return cloudinary.uploader.upload(file64.content, {
        folder: folder,
        resource_type: 'auto'
      });
    });

    const results = await Promise.all(uploadPromises);
    
    return results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Multiple image upload failed');
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Delete multiple images
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId)
    );
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Cloudinary multiple delete error:', error);
    return false;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  cloudinary
};
