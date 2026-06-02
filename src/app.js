const express = require("express");
const cors = require("cors");
require("dotenv").config();

const branchRoutes = require("./routes/branchRoutes.js");
// Awashya nam oyage anith routes (authRoutes, warehouseRoutes) methanata add karanna

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

// App eka export karanawa server.js ekata ganna
module.exports = app;