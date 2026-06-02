const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
    createTransfer,
    updateTransfer,
    deleteTransfer,
    dispatchTransfer,
    completeTransfer,
    cancelTransfer,
    listTransfers,
    getTransferById,
    listInventoryMovements,
    getTransferAnalytics
} = require("../controllers/stockTransferController");

const router = express.Router();
const manageRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER"];

router.use(protect);

router.get("/analytics/summary", getTransferAnalytics);
router.get("/movements/history", listInventoryMovements);
router.get("/", listTransfers);
router.get("/:id", getTransferById);

router.post("/", authorizeRoles(...manageRoles), createTransfer);
router.put("/:id", authorizeRoles(...manageRoles), updateTransfer);
router.delete("/:id", authorizeRoles(...manageRoles), deleteTransfer);
router.patch("/:id/dispatch", authorizeRoles(...manageRoles), dispatchTransfer);
router.patch("/:id/complete", authorizeRoles(...manageRoles), completeTransfer);
router.patch("/:id/cancel", authorizeRoles(...manageRoles), cancelTransfer);

module.exports = router;
