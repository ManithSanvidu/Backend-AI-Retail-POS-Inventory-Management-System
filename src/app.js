const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const customerRoutes = require("./routes/customerRoutes");

const app = express();

// ========================
// MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ========================
// ROUTES
// ========================
app.get("/", (req, res) => {
    res.json({
        message: "Retail POS API Running..."
    });
});

// Customer Module Routes 
app.use("/api/customers", customerRoutes);

// ========================
// ERROR HANDLING (basic)
// ========================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

module.exports = app;