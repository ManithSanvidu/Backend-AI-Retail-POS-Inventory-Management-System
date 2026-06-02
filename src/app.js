const express = require("express");
const cors = require("cors");
const stockTransferRoutes = require("./routes/stockTransferRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/stock-transfers", stockTransferRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Retail POS backend is running"
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

module.exports = app;
