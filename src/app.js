const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const stockTransferRoutes = require("./routes/stockTransferRoutes");
const branchRoutes = require("./routes/branchRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/stock-transfers", stockTransferRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/notifications", notificationRoutes);

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
