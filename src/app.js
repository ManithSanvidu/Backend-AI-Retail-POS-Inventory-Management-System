const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 1. Import All Routes
const authRoutes = require("./routes/authRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// 2. Middleware
// CLIENT_URL එක හරහා නිවැරදිව CORS හසුරුවා ඇත
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health Check / Default Route
app.get("/", (req, res) => {
  res.json({ message: "🏭 AI Retail POS API is running!" });
});

// 4. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/notifications", notificationRoutes);

// 5. 404 Error Handler (නැති Route එකකට කතා කළොත්)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 6. Global Error Handler (Server එකේ error එකක් ආවොත් Crash වෙන එක නවත්වන්න)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;