const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require("./config/db");
const setupNotificationSockets = require('./sockets/notificationSockets');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => res.send("POS API Running ✅"));

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

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
