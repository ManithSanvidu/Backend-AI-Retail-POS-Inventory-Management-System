const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const EmailLog = require('../models/EmailLog');
const SmsLog = require('../models/SmsLog');
const Supplier = require('../models/Supplier');
const { sendSMS } = require('../utils/smsSender');

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    // Note: Assuming `req.user._id` is populated by your Auth middleware.
    // For testing without auth middleware, you might need to pass userId in query params
    const userId = req.user ? req.user._id : req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50
      
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark a specific notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user preferences
const getPreferences = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    let prefs = await NotificationPreference.findOne({ userId });
    if (!prefs) {
      // Return default preferences if none explicitly set
      prefs = { userId, emailEnabled: true, smsEnabled: false, inAppEnabled: true };
    }
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const { emailEnabled, smsEnabled, inAppEnabled } = req.body;

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      { emailEnabled, smsEnabled, inAppEnabled },
      { new: true, upsert: true } // Create if doesn't exist
    );
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get email logs
const getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find({})
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send SMS to selected suppliers
const sendSmsToSuppliers = async (req, res) => {
  try {
    const { supplierIds, message } = req.body;

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return res.status(400).json({ error: 'Supplier IDs are required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });
    if (suppliers.length === 0) {
      return res.status(404).json({ error: 'No matching suppliers found' });
    }

    const results = [];
    
    for (const supplier of suppliers) {
      if (!supplier.phone) {
        results.push({ supplierId: supplier._id, status: 'Failed', error: 'No phone number available' });
        continue;
      }

      const success = await sendSMS(supplier.phone, message);
      
      const status = success ? 'Sent' : 'Failed';
      const errorMessage = success ? '' : 'Failed to send SMS via SMS Provider';
      
      await SmsLog.create({
        supplierId: supplier._id,
        recipientPhone: supplier.phone,
        message,
        status,
        errorMessage
      });

      results.push({ supplierId: supplier._id, status });
    }

    res.json({ success: true, message: 'SMS dispatch process completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  getEmailLogs,
  sendSmsToSuppliers
};
