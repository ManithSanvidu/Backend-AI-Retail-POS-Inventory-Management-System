const dns = require("dns");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectDB = async () => {
    try {
        const dnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
            .split(",")
            .map((server) => server.trim())
            .filter(Boolean);
        dns.setServers(dnsServers);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || "retail_pos_db"
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
