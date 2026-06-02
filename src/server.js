const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const branchRoutes = require("./routes/branchRoutes.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/branches", branchRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "AI Retail POS Backend Running",
  });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });