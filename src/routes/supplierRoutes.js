const express = require('express');
const mongoose = require('mongoose');
const controller = require("../controllers/supplierController");

const router = express.Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

const requireMongoConnection = (req, res, next) => {
  if (!isMongoConnected()) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not connected yet. Check MONGO_URI, DB_NAME, and Atlas network access.',
    });
  }
  next();
};

// Performance Reports
router.get("/reports/performance", controller.getAllPerformanceReports);
router.get("/:id/performance", requireMongoConnection, controller.getPerformanceReport);

// Procurement and Transactions
router.post("/:id/transactions", requireMongoConnection, controller.addTransaction);
router.get("/:id/procurement", requireMongoConnection, controller.getProcurementHistory);

// Contract Management
router.get("/:id/contract", requireMongoConnection, controller.getContract);
router.put("/:id/contract", requireMongoConnection, controller.updateContract);

// CRUD for Supplier
router.post("/", requireMongoConnection, controller.createSupplier);
router.get("/", controller.getSuppliers);
router.get("/:id", requireMongoConnection, controller.getSupplier);
router.put("/:id", requireMongoConnection, controller.updateSupplier);
router.delete("/:id", requireMongoConnection, controller.deleteSupplier);

module.exports = router;
