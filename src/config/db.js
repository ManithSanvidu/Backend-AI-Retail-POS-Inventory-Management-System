
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