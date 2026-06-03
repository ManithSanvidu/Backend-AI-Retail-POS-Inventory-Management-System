@@ -0,0 +1,81 @@
// <<<<<<< HEAD

// const mongoose = require('mongoose');

// const connectDB = async () => {
//   if (!process.env.MONGO_URI) {
//     console.error('MONGO_URI is missing in .env file');
//     process.exit(1);
//   }

//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('MongoDB Connection Failed:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
// =======
// const mongoose = require("mongoose");

// mongoose.set("bufferCommands", false);

// const connectDB = async () => {
//   const mongoUri = process.env.MONGO_URI;
//   const dbName = process.env.DB_NAME || "retail_pos_db";

//   if (!mongoUri) {
//     console.warn("MONGO_URI is missing. Server started without MongoDB.");
//     return null;
//   }

//   try {
//     const conn = await mongoose.connect(mongoUri, {
//       dbName,
//       serverSelectionTimeoutMS: 8000,
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
//     return conn;
//   } catch (error) {
//     console.warn(`MongoDB connection failed: ${error.message}`);
//     return null;
//   }
// };

// module.exports = connectDB;
// >>>>>>> ad203315202fdc745ae073c346658838b03209d0
const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI;
	const dbName = process.env.DB_NAME || 'retail_pos_db';

	if (!mongoUri) {
		console.warn('MONGO_URI is missing. Server started without MongoDB.');
		return null;
	}

	try {
		const conn = await mongoose.connect(mongoUri, {
			dbName,
			serverSelectionTimeoutMS: 8000,
		});

		console.log(
			`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`,
		);

		return conn;
	} catch (error) {
		console.warn(`MongoDB connection failed: ${error.message}`);
		return null;
	}
};

module.exports = connectDB;