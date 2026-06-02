const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

// --- GLOBAL MIDDLEWARES ---

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse URL-encoded bodies (for form-data handling)
app.use(express.urlencoded({ extended: true }));

// --- ROUTE MOUNTINGS ---

// Base Health Check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "POS Inventory System Backend is running smoothly"
    });
});

// Authentication endpoints
app.use("/api/auth", authRoutes);

// Inventory Management Module endpoints (Part 9)
app.use("/api/inventory", inventoryRoutes);

// --- 404 NOT FOUND HANDLER ---
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
    console.error("Global Handler Caught Error:", err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Mongoose cast / validation errors
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with field of ID format: ${err.value}`;
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(", ");
    }

    // Handle Mongo duplicate key errors
    if (err.code === 11000) {
        statusCode = 400;
        message = `Duplicate resource value entered: ${JSON.stringify(err.keyValue)}`;
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
});

module.exports = app;
