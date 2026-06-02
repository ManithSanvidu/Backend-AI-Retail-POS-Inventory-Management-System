const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['INFO', 'WARNING', 'ALERT', 'SUCCESS'],
    default: 'INFO'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  channels: {
    type: [String],
    default: ['in-app'] // Options: 'in-app', 'email', 'sms'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String, // Optional URL to redirect when clicked
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);