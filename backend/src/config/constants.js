module.exports = {
  // User Roles
  USER_ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
    COD: 'cash_on_delivery'
  },

  // Helmet Types
  HELMET_TYPES: [
    'Full Face',
    'Open Face',
    'Modular',
    'Half Helmet',
    'Off-Road',
    'Dual Sport'
  ],

  // Sizes
  SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'],

  // Address Types
  ADDRESS_TYPES: {
    HOME: 'home',
    WORK: 'work',
    OTHER: 'other'
  },

  // JWT
  JWT_EXPIRE_TIME: '7d',
  JWT_COOKIE_EXPIRE: 7, // days

  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,

  // Image Upload
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],

  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Email
  EMAIL_FROM_NAME: 'AegisGear',
  EMAIL_VERIFICATION_EXPIRE: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRE: 10 * 60 * 1000 // 10 minutes
};
