const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

dotenv.config();

// app.js eken app eka gannawa
const app = require("./app");
const connectDB = require("./config/db");
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