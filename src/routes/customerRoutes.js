const router = require("express").Router();

const controller = require("../controllers/customerController");

// CRUD
router.post("/", controller.createCustomer);
router.get("/", controller.getCustomers);
router.get("/:id", controller.getCustomer);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);

// EXTRA FEATURES (Part 6 requirements)
// router.get("/:id/purchases", controller.purchaseHistory);
// router.get("/analytics/overview", controller.analytics);

module.exports = router;