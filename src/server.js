const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routes & Sockets
const branchRoutes = require("./routes/branchRoutes.js");
const setupNotificationSockets = require('./sockets/notificationSockets');

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Make io globally accessible (NotificationService වැනි දේවල් වලට භාවිතා කිරීමට)
global.io = io;

// Setup Socket handlers
if (setupNotificationSockets) {
  setupNotificationSockets(io);
}

// Routes
app.use("/api/branches", branchRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "AI Retail POS Backend Running",
  });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    
    // වැදගත්: app.listen වෙනුවට server.listen භාවිතා කළ යුතුයි
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });