require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const setupNotificationSockets = require("./sockets/notificationSockets");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

global.io = io;
setupNotificationSockets(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
