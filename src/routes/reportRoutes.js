const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const {
    getSummary,
    getSalesReport,
    getInventoryReport,
    getBranchPerformance,
    getReportHistory,
    getScheduledReports,
    exportPDF,
    exportExcel,
} = require('../controllers/reportController');

// ─────────────────────────────────────────────────────────────
// MongoDB connection guard
// Matches the pattern used in supplierRoutes.js
// ─────────────────────────────────────────────────────────────
const requireMongoConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        // Warn but do not block — controller handles fallback data
        req.mongoUnavailable = true;
    }
    next();
};

// ─────────────────────────────────────────────────────────────
// AUTH NOTE:
// authMiddleware (protect/authorize) is entirely commented out
// in src/middleware/authMiddleware.js due to an unresolved merge
// conflict. Routes are intentionally left unprotected until the
// Auth team re-enables the middleware.
//
// BLOCKER: Add back once Auth middleware is active:
//   const { protect, authorize } = require('../middleware/authMiddleware');
//   router.get('/summary', protect, authorize('admin', 'manager'), getSummary);
// ─────────────────────────────────────────────────────────────

// GET /api/reports/summary
router.get('/summary', requireMongoConnection, getSummary);

// GET /api/reports/sales
router.get('/sales', requireMongoConnection, getSalesReport);

// GET /api/reports/inventory
router.get('/inventory', requireMongoConnection, getInventoryReport);

// GET /api/reports/branch-performance
router.get('/branch-performance', requireMongoConnection, getBranchPerformance);

// GET /api/reports/history
router.get('/history', requireMongoConnection, getReportHistory);

// GET /api/reports/scheduled
router.get('/scheduled', requireMongoConnection, getScheduledReports);

// POST /api/reports/export/pdf  (placeholder — no PDF package)
router.post('/export/pdf', exportPDF);

// POST /api/reports/export/excel  (placeholder — no Excel package)
router.post('/export/excel', exportExcel);

module.exports = router;
