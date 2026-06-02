const express = require('express');
const cors = require('cors');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/purchase-orders', purchaseOrderRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'AI-Powered Retail POS backend is running',
    health: '/health',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend-ai-retail-pos-inventory-management-system',
    timestamp: new Date().toISOString(),
  });
});

app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(500).json({
    message: 'Server error',
    error: error.message,
  });
});

module.exports = app;
