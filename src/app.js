const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// --- Middleware ---
// CORS එක first! (Meka wenas karanna epa, frontend port 5173 ekata meka one)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const salesRoutes = require('./routes/salesRoutes'); 
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const recommendationsRoutes = require('./routes/recommendations');
const chatRoutes = require('./routes/chat');
const nlqueryRoutes = require('./routes/nlquery');
const decisionsRoutes = require('./routes/decisions');
const userRoutes = require('./routes/userRoutes');
const branchRoutes = require('./routes/branchRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require("./routes/customerRoutes");
const returnsRoutes = require("./routes/returnsRoutes");

// --- API Routes ---
// Auth, Users & HR
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);

// Core Business, Inventory & POS
app.use('/api/branches', branchRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/promotions', promotionRoutes);
app.use("/api/returns", returnsRoutes);

// Supply Chain
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);

// AI Features
app.use('/api/chat', chatRoutes);
app.use('/api/nlquery', nlqueryRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// --- Health Checks ---
app.get('/', (req, res) => res.json({ message: 'AI-Powered Multi-Branch Retail POS backend is running...' }));
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Server running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server running' }));

// --- Error Handling ---
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(err.stack); // Terminal eketa error eka pennanna
    
    res.status(statusCode).json({
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;