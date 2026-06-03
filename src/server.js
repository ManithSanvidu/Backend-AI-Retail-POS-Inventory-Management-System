// <<<<<<< HEAD
// require('dotenv').config();
// const connectDB = require('./config/db');
// const app = require('./app');

// const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   });
// =======
// const path = require("path");
// const dns = require("dns");

// require("dotenv").config({
//   path: path.resolve(__dirname, "../.env"),
// });

// if (dns.setDefaultResultOrder) {
//   dns.setDefaultResultOrder("ipv4first");
// }

// const http = require("http");
// const { Server } = require("socket.io");
// const app = require("./app");
// const connectDB = require("./config/db");
// const sockethandler = require("./sockets/sockethandler");
// const setupNotificationSockets = require("./sockets/notificationSockets");
// const { initInventoryAlertJob } = require("./jobs/inventoryAlertJob");

// const PORT = process.env.PORT || 5000;
// const server = http.createServer(app);

// server.on("error", (error) => {
//   if (error.code === "EADDRINUSE") {
//     console.error(`Port ${PORT} is already in use. Stop the old server or change PORT in .env.`);
//     process.exit(1);
//   }

//   console.error(`Server error: ${error.message}`);
//   process.exit(1);
// });

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     credentials: true,
//   },
// });

// global.io = io;
// app.set("io", io);
// sockethandler(io);
// setupNotificationSockets(io);

// const startBackgroundServices = async (dbConnection) => {
//   if (!dbConnection) {
//     console.warn("Skipping database-backed startup jobs because MongoDB is not connected.");
//     return;
//   }

//   const seedEmployees = require("./utils/seedEmployees");
//   await seedEmployees();
//   initInventoryAlertJob();
// };

// server.listen(PORT, async () => {
//   console.log("================================================================");
//   console.log("POS RETAIL SYSTEM SERVER RUNNING");
//   console.log(`   Running Environment : ${process.env.NODE_ENV || "development"}`);
//   console.log(`   Listening Port      : ${PORT}`);
//   console.log(`   Healthcheck Route   : http://localhost:${PORT}/health`);
//   console.log("================================================================");

//   const dbConnection = await connectDB();
//   await startBackgroundServices(dbConnection);
// });

// process.on("unhandledRejection", (err) => {
//   console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// >>>>>>> ad203315202fdc745ae073c346658838b03209d0
// });
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
		console.error(
			`Port ${PORT} is already in use. Stop the old server or change PORT in .env.`,
		);
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

const startBackgroundServices = async (dbConnection) => {
	if (!dbConnection) {
		console.warn(
			'Skipping database-backed startup jobs because MongoDB is not connected.',
		);
		return;
	}

	const seedEmployees = require('./utils/seedEmployees');
	await seedEmployees();

	initInventoryAlertJob();
};

server.listen(PORT, async () => {
	console.log(
		'================================================================',
	);
	console.log('POS RETAIL SYSTEM SERVER RUNNING');
	console.log(`Running Environment : ${process.env.NODE_ENV || 'development'}`);
	console.log(`Listening Port      : ${PORT}`);
	console.log(`Healthcheck Route   : http://localhost:${PORT}/api/health`);
	console.log(
		'================================================================',
	);

	const dbConnection = await connectDB();
	await startBackgroundServices(dbConnection);
});

process.on('unhandledRejection', (err) => {
	console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
	server.close(() => process.exit(1));
});