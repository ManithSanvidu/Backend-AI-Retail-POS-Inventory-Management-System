const http = require('http');
const { Server } = require('socket.io');
const dotenv = require("dotenv");

dotenv.config();

// app.js eken app eka gannawa
const app = require("./app");
const connectDB = require("./config/db");
const setupNotificationSockets = require('./sockets/notificationSockets');

const PORT = process.env.PORT || 5000;

// Create HTTP server instead of listening directly on Express app
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*', 
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io globally accessible (used by NotificationService)
global.io = io;

// Setup Socket handlers
setupNotificationSockets(io);

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