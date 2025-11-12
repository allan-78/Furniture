const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ============================================
// GENERAL MIDDLEWARE
// ============================================

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ... existing middleware ...

// ============================================
// DEBUG MIDDLEWARE - REMOVE LATER
// ============================================
app.use((req, res, next) => {
  console.log('📨 Incoming Request:');
  console.log('  Method:', req.method);
  console.log('  URL:', req.url);
  console.log('  Headers:', req.headers);
  console.log('  Body:', req.body);
  console.log('---');
  next();
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
// ...

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AegisGear API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AegisGear API is running',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'Connected'
  });
});

// ============================================
// API ROUTES
// ============================================

// Auth Routes - ✅ WORKING (Step 4)
app.use('/api/auth', require('./routes/auth'));

// User Routes - ⏳ TODO (Step 6)
// app.use('/api/user/profile', require('./routes/user/user'));
// app.use('/api/user/cart', require('./routes/user/cart'));
// app.use('/api/user/orders', require('./routes/user/order'));
// app.use('/api/user/reviews', require('./routes/user/review'));
app.use('/api/user', require('./routes/user/user'));
app.use('/api/user/addresses', require('./routes/user/address'));
app.use('/api/cart', require('./routes/user/cart'));
app.use('/api/orders', require('./routes/user/order'));

// Admin Routes - ⏳ TODO (Step 5)
app.use('/api/admin/products', require('./routes/admin/product'));
app.use('/api/admin/categories', require('./routes/admin/category'));
app.use('/api/admin/brands', require('./routes/admin/brand'));
app.use('/api/admin/orders', require('./routes/admin/order')); 
// app.use('/api/admin/orders', require('./routes/admin/orderManagement'));
// app.use('/api/admin/users', require('./routes/admin/userManagement'));
// app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));

// Public Routes (no auth needed) - ⏳ TODO (Step 5)
app.use('/api/products', require('./routes/product'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/brands', require('./routes/brand'));

// ============================================
// 404 HANDLER
// ============================================


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
