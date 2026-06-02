const express = require("express");
const cors = require("cors");

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