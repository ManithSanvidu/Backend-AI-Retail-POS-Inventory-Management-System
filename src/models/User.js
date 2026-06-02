const mongoose = require('mongoose');

// This is a basic scaffold for the User model so the Notification Service can query it.
// The Authentication/User Management teams will likely expand this later.
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['ADMIN', 'MANAGER', 'CASHIER', 'SECURITY_TEAM', 'CUSTOMER'], 
    default: 'CUSTOMER' 
  },
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch' // Assuming a Branch model will be created by Part 4
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);