const express = require('express');
const cors = require('cors');

// Import routes
const recommendationsRoutes = require('./routes/recommendations');
const chatRoutes = require('./routes/chat');
const nlqueryRoutes = require('./routes/nlquery');
const decisionsRoutes = require('./routes/decisions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res) => {
    res.send('AI Retail POS API is running...');
});

// Mount Routes
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/nlquery', nlqueryRoutes);
app.use('/api/decisions', decisionsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
