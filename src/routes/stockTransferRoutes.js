const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
    createTransfer,
    updateTransfer,
    deleteTransfer,
    dispatchTransfer,
    approveTransfer,
    completeTransfer,
    cancelTransfer,
    rejectTransfer,
    listTransfers,
    getTransferById,
    listInventoryMovements,
    getTransferAnalytics
} = require("../controllers/stockTransferController");

const router = express.Router();

const adminRoles = ["SUPER_ADMIN", "ADMIN"];
const managerRoles = ["SUPER_ADMIN", "MANAGER"];
const readRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"];

router.use(protect);

// Read-only: tracking, stock history (cashier + all roles)
router.get("/analytics/summary", authorizeRoles(...readRoles), getTransferAnalytics);
router.get("/movements/history", authorizeRoles(...readRoles), listInventoryMovements);
router.get("/", authorizeRoles(...readRoles), listTransfers);
router.get("/:id", authorizeRoles(...readRoles), getTransferById);

// Manager: Transfer Request tab
router.post("/", authorizeRoles(...managerRoles), createTransfer);

// Admin: Progress Tracking — Approve / Reject / Cancel
router.patch("/:id/approve", authorizeRoles(...adminRoles), approveTransfer);
router.patch("/:id/dispatch", authorizeRoles(...adminRoles), dispatchTransfer);
router.patch("/:id/reject", authorizeRoles(...adminRoles), rejectTransfer);
router.patch("/:id/cancel", authorizeRoles(...adminRoles), cancelTransfer);

// Manager: Confirm Receipt on inbound transfers (destination branch only)
router.patch("/:id/complete", authorizeRoles(...managerRoles), completeTransfer);

// Admin maintenance on pending requests
router.put("/:id", authorizeRoles(...adminRoles), updateTransfer);
router.delete("/:id", authorizeRoles(...adminRoles), deleteTransfer);

module.exports = router;
