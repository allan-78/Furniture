const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  resendVerification
} = require('../controllers/auth/authController');

const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  emailValidation,
  passwordValidation
} = require('../utils/validators');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', emailValidation, forgotPassword);
router.put('/reset-password/:token', passwordValidation, resetPassword);
router.post('/resend-verification', emailValidation, resendVerification);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
