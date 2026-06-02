const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const { sendEmail } = require('../utils/emailSender');
const systemEvents = require('../events/eventBus');

// Mock User model fetch for email address. In reality, you'd populate or query the user from DB.
const getMockUserContactInfo = (userId) => {
  return { email: 'mock_user@example.com', phone: '+1234567890' }; 
};

const processAlert = async (data) => {
  const { userId, title, message, type = 'INFO', channels = ['in-app'], link } = data;

  try {
    // 1. Fetch User Preferences (Defaults to all enabled if not found)
    let prefs = await NotificationPreference.findOne({ userId });
    if (!prefs) {
      prefs = { emailEnabled: true, smsEnabled: false, inAppEnabled: true };
    }

    // 2. In-App Notification (Database + WebSocket)
    if (channels.includes('in-app') && prefs.inAppEnabled) {
      const newNotif = await Notification.create({
        recipient: userId,
        type,
        title,
        message,
        channels,
        link
      });

      // Emit to WebSocket room (user's ID)
      if (global.io) {
        global.io.to(userId.toString()).emit('new-notification', newNotif);
      }
    }

    // 3. Email Notification
    if (channels.includes('email') && prefs.emailEnabled) {
      const userInfo = getMockUserContactInfo(userId);
      await sendEmail(userInfo.email, title, message);
    }

    // 4. SMS Notification (Mocked for now)
    if (channels.includes('sms') && prefs.smsEnabled) {
      const userInfo = getMockUserContactInfo(userId);
      console.log(`[Mock SMS] Sent to ${userInfo.phone}: ${title} - ${message}`);
    }

  } catch (error) {
    console.error('Error processing alert:', error);
  }
};

// Listen to the central Event Bus
systemEvents.on('SEND_ALERT', processAlert);

module.exports = { processAlert };
