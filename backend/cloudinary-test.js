require('dotenv').config();
const { cloudinary } = require('./src/utils/cloudinary');

async function testCloudinary() {
  try {
    console.log('🔍 Testing Cloudinary connection...');
    console.log('📦 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('🔑 API Key:', process.env.CLOUDINARY_API_KEY);
    console.log('🔐 API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'Not set');
    console.log('');
    
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary connected successfully!');
    console.log('📊 Response:', result);
  } catch (error) {
    console.error('❌ Cloudinary connection failed!');
    console.error('Error:', error.message);
    
    if (error.http_code === 401) {
      console.error('');
      console.error('🔴 Authentication failed. Please check:');
      console.error('  1. CLOUDINARY_CLOUD_NAME is correct');
      console.error('  2. CLOUDINARY_API_KEY is correct');
      console.error('  3. CLOUDINARY_API_SECRET is correct');
    }
  }
}

testCloudinary();
