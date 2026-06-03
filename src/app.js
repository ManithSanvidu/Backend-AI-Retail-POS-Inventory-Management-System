const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Route files
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const branchRoutes = require("./routes/branchRoutes");
const customerRoutes = require("./routes/customerRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");

const app = express();

// --- GLOBAL MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "AI-Powered Retail POS backend is running",
    health: "/health",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "backend-ai-retail-pos-inventory-management-system",
    message: "POS Inventory System Backend is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// --- ROUTE MOUNTINGS ---
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);

// --- 404 NOT FOUND HANDLER ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error("Global Handler Caught Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with field of ID format: ${err.value}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate resource value entered: ${JSON.stringify(err.keyValue)}`;
  }

  res.status(statusCode).json({
    success: false,
    message: "Server error",
    error: message,
  });
});

module.exports = app;
