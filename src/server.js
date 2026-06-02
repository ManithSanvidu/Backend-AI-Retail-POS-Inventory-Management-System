require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

// =========================
// LOAD ALL MODELS FIRST
// =========================
require("./models/Branch");
require("./models/Customer");
require("./models/Sale");

const PORT = process.env.PORT || 5000;

// Connect Database first
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});