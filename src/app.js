const express = require("express");
const cors = require("cors");
require("dotenv").config();

const warehouseRoutes = require("./routes/warehouseRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "🏭 Retail POS API Running!" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;

const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("AI Retail POS Backend is running");
});

app.use("/api/products", productRoutes);
app.use("/api/branches", branchRoutes);

module.exports = app;
