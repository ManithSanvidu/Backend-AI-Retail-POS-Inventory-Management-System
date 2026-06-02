const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Route
app.get('/', (req, res) => {
  res.send('Retail POS & Inventory Management System API is running...');
});

// Module Routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

module.exports = app;
