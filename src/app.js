const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Route
app.get('/', (req, res) => {
  res.send('AI Retail POS Backend is running...');
});

// Module Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;
