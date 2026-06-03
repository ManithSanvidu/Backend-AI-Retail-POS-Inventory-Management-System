const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const sockethandler = require("./sockets/sockethandler");
const setupNotificationSockets = require("./sockets/notificationSockets");
const { initInventoryAlertJob } = require("./jobs/inventoryAlertJob");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

sockethandler(io);
setupNotificationSockets(io);

// Initialize database and background jobs
connectDB()
  .then(() => {
    initInventoryAlertJob();
  })
  .catch(() => {
    // Continue startup even if DB connection fails; job will fallback gracefully
    initInventoryAlertJob();
  });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
