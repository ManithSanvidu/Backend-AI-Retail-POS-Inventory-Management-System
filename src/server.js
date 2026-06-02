const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const setupNotificationSockets = require('./sockets/notificationSockets');

const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server instead of listening directly on Express app
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Configure to match frontend origin in production
    methods: ['GET', 'POST']
  }
});

// Make io globally accessible (used by NotificationService)
global.io = io;

// Setup Socket handlers
setupNotificationSockets(io);

// Connect to MongoDB and Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
