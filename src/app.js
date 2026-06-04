const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Routes import kirima
const warehouseRoutes = require("./routes/warehouseRoutes");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes"); // 👈 Meka aluthin add kala

const app = express();

// CORS එක first!
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());

// Routes setup kirima
app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/employees", employeeRoutes); // 👈 Frontend ekata employees data denna meka one

// Health check
app.get("/", (req, res) => res.json({ message: "🏭 Retail POS API Running!" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;