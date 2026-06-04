const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register',       register);
router.post('/login',          login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Private routes
router.get('/profile',  protect, getProfile);
router.put('/profile',  protect, updateProfile);

// Role-based
router.get('/admin-data',   protect, authorize('admin'),            (req, res) => res.json({ message: 'Admin only' }));
router.get('/manager-data', protect, authorize('admin', 'manager'), (req, res) => res.json({ message: 'Manager data' }));

module.exports = router;