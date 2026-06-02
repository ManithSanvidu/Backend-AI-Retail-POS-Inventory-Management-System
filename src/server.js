require("dotenv").config();
const dns = require("dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const sockethandler = require("./sockets/sockethandler");
const setupNotificationSockets = require("./sockets/notificationSockets");
const { initInventoryAlertJob } = require("./jobs/inventoryAlertJob");

// --- DB CONNECTION AND START SERVER ---
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // Auto seed employee database data if empty
    const seedEmployees = require("./utils/seedEmployees");
    await seedEmployees();

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

    // Make io globally accessible
    global.io = io;

    // Mount socket.io instance onto the express app context so controllers can access it
    app.set("io", io);

    // Initialize real‑time websocket listener events
    sockethandler(io);
    setupNotificationSockets(io);

    // --- BACKGROUND SERVICES SCHEDULES ---
    initInventoryAlertJob();

    // --- PORT LISTEN BINDING ---
    const runningServer = server.listen(PORT, () => {
        console.log(`================================================================`);
        console.log(`🚀 POS RETAIL SYSTEM SERVER RUNNING`);
        console.log(`   Running Environment : ${process.env.NODE_ENV || "development"}`);
        console.log(`   Listening Port      : ${PORT}`);
        console.log(`   Healthcheck Route   : http://localhost:${PORT}/health`);
        console.log(`================================================================`);
    });

    // Handle unhandled promise rejections safely
    process.on("unhandledRejection", (err, promise) => {
        console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
        runningServer.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
