<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", process.env.CLIENT_URL],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/warehouses", require("./routes/warehouseRoutes")); 

app.get("/", (req, res) => res.send("POS API Running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
=======
const path = require('path');
const dns = require('dns');

require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
});

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const sockethandler = require('./sockets/sockethandler');
const setupNotificationSockets = require('./sockets/notificationSockets');
const { initInventoryAlertJob } = require('./jobs/inventoryAlertJob');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the old server or change PORT in .env.`);
        process.exit(1);
    }

    console.error(`Server error: ${error.message}`);
    process.exit(1);
});

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    },
});

global.io = io;
app.set('io', io);

sockethandler(io);
setupNotificationSockets(io);

if (process.env.ENABLE_NOTIFICATION_WORKER === 'true') {
    try {
        require('./workers/notificationWorker');
        console.log('✅ Notification worker started');
    } catch (error) {
        console.warn(`⚠️ Notification worker not started: ${error.message}`);
    }
} else {
    console.log('ℹ️ Notification worker disabled. Set ENABLE_NOTIFICATION_WORKER=true to enable it.');
}

const startBackgroundServices = async (dbConnection) => {
    if (!dbConnection) {
        console.warn('Skipping database-backed startup jobs because MongoDB is not connected.');
        return;
    }

    const seedEmployees = require('./utils/seedEmployees');

    await seedEmployees();
    initInventoryAlertJob();
};

server.listen(PORT, async () => {
    console.log('================================================================');
    console.log('POS RETAIL SYSTEM SERVER RUNNING');
    console.log(`Running Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`Listening Port      : ${PORT}`);
    console.log(`Healthcheck Route   : http://localhost:${PORT}/api/health`);
    console.log('================================================================');

    const dbConnection = await connectDB();
    await startBackgroundServices(dbConnection);
});

process.on('unhandledRejection', (err) => {
    console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});
>>>>>>> 833517d8a63a21767cd925cee9fe630271f16c63
