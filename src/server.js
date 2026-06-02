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
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const sockethandler = require("./sockets/sockethandler");
const { initInventoryAlertJob } = require("./jobs/inventoryAlertJob");

// --- DB CONNECTION ---
connectDB();

// --- HTTP SERVER WRAPPER ---
const server = http.createServer(app);

// --- SOCKET.IO SERVICE ATTACHMENT ---
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust origins in production environments for tightened CORS security
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true
    }
});

// Mount socket.io instance onto the express app context so controllers can access it
app.set("io", io);

// Initialize real‑time websocket listener events (join branch, leave branch, status alerts)
sockethandler(io);

// --- BACKGROUND SERVICES SCHEDULES ---
// Initialize hourly check for low‑stock thresholds, alerting admins immediately on boot and scheduling cron checks
initInventoryAlertJob();

// --- PORT LISTEN BINDING ---
const PORT = process.env.PORT || 5000;

const runningServer = server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 POS INVENTORY MODULE SERVER RUNNING`);
    console.log(`   Running Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Listening Port      : ${PORT}`);
    console.log(`   Healthcheck Route   : http://localhost:${PORT}/health`);
    console.log(`================================================================`);
});

// Handle unhandled promise rejections safely
process.on("unhandledRejection", (err, promise) => {
    console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    runningServer.close(() => process.exit(1));
});
