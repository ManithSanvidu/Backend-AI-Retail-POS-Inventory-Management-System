const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  getEmailLogs,
  sendSmsToSuppliers
} = require('../controllers/NotificationController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
// Notification endpoints
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead); // Put this before /:id/read to avoid route conflict
router.put('/:id/read', markAsRead);

// Preferences endpoints
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Email Logs endpoint
router.get('/emails', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), getEmailLogs);

// SMS endpoint
router.post('/sms/suppliers', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), sendSmsToSuppliers);

module.exports = router;
