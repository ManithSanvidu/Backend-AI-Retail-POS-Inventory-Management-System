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

// CRUD for Supplier
router.post("/", requireMongoConnection, controller.createSupplier);
router.get("/", controller.getSuppliers);
router.get("/:id", requireMongoConnection, controller.getSupplier);
router.put("/:id", requireMongoConnection, controller.updateSupplier);
router.delete("/:id", requireMongoConnection, controller.deleteSupplier);

module.exports = router;
