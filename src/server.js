const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config(); // This is all you need for dotenv

// app.js eken app eka gannawa
const app = require("./app");
const connectDB = require("./config/db");
const setupNotificationSockets = require('./sockets/notificationSockets');

// Note: I removed `const app = express()` and the cors/json middleware 
// here because those should ideally be handled inside your `app.js` file.

// Create HTTP server (Socket.IO සඳහා Express app එක වෙනුවට HTTP server එකක් සෑදීම අනිවාර්ය වේ)
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*', 
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io globally accessible
global.io = io;

// Setup Socket handlers
setupNotificationSockets(io);

// Define PORT (Add this so the server knows where to listen!)
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and Start Server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });