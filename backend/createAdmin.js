require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@aegisgear.com' });
    
    if (existingAdmin) {
      console.log('');
      console.log('⚠️  Admin user already exists!');
      console.log('=====================================');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('✅ Email Verified:', existingAdmin.isEmailVerified);
      console.log('=====================================');
      console.log('');
      console.log('💡 You can login with:');
      console.log('   Email: admin@aegisgear.com');
      console.log('   Password: Admin@123456');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'AegisGear',
      email: 'admin@aegisgear.com',
      password: 'Admin@123456',
      phone: '09999999999',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    console.log('');
    console.log('🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Password: Admin@123456');
    console.log('👤 Role:', admin.role);
    console.log('✅ Email Verified: Yes');
    console.log('🆔 ID:', admin._id);
    console.log('=====================================');
    console.log('');
    console.log('💡 You can now login with these credentials');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error creating admin:');
    console.error(error.message);
    console.error('');
    process.exit(1);
  }
};

createAdmin();
    