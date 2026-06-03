const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes from Dev branch
const authRoutes = require('./routes/authRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const recommendationsRoutes = require('./routes/recommendations');

// Import routes from Kaveesha branch
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default routes
app.get('/', (req, res) => {
    res.json({ message: 'AI-Powered Multi-Branch Retail POS backend is running...' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server running' });
});

// Mount All Routes
app.use('/api/auth', authRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Global Error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;