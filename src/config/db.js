const mongoose = require("mongoose");

/**
 * Connect to MongoDB instance using mongoose
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/pos_inventory";
        
        const conn = await mongoose.connect(mongoURI, {
            // Options can be empty for modern Mongoose 6+ configurations,
            // but setting basic structure allows clean connections
        });

        console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database Error] Failed connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
