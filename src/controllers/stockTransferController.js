const mongoose = require("mongoose");
const StockTransfer = require("../models/StockTransfer");
const Inventory = require("../models/Inventory");
const InventoryMovement = require("../models/InventoryMovement");
const Branch = require("../models/Branch");
const Product = require("../models/Product");
const AuditLog = require("../models/Auditlog");

const parsePagination = (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};

const buildTransferFilters = (query) => {
    const filters = {};

    if (query.status) {
        filters.status = query.status;
    }

    if (query.fromBranch) {
        filters.fromBranch = query.fromBranch;
    }

    if (query.toBranch) {
        filters.toBranch = query.toBranch;
    }

    if (query.startDate || query.endDate) {
        filters.transferDate = {};
        if (query.startDate) {
            filters.transferDate.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            filters.transferDate.$lte = new Date(query.endDate);
        }
    }

    return filters;
};

const validateTransferItems = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return "At least one transfer item is required.";
    }

    const hasInvalidQuantity = items.some((item) => !item.product || Number(item.quantity) <= 0);
    if (hasInvalidQuantity) {
        return "Each item must include a valid product and quantity > 0.";
    }

    const productIds = items.map((item) => item.product);
    const products = await Product.countDocuments({ _id: { $in: productIds } });

    if (products !== productIds.length) {
        return "One or more products do not exist.";
    }

    return null;
};

const checkStockAvailability = async (fromBranch, items, session = null) => {
    for (const item of items) {
        const inventory = await Inventory.findOne({
            branch: fromBranch,
            product: item.product
        }).session(session);

        if (!inventory || inventory.quantity < item.quantity) {
            return {
                available: false,
                message: `Insufficient stock for product ${item.product}.`
            };
        }
    }

    return { available: true };
};

const createAuditLog = async (req, action, metadata) => {
    await AuditLog.create({
        user: req.user?._id || null,
        action,
        module: "STOCK_TRANSFER",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        metadata
    });
};

const pushActivityLog = (transfer, status, note, userId) => {
    transfer.activityLogs.push({
        status,
        note,
        changedBy: userId || null
    });
};

const recordInventoryMovement = async ({
    transferId,
    branch,
    product,
    movementType,
    quantity,
    previousQuantity,
    newQuantity,
    performedBy,
    note,
    session
}) => {
    await InventoryMovement.create(
        [
            {
                transfer: transferId,
                branch,
                product,
                movementType,
                quantity,
                previousQuantity,
                newQuantity,
                performedBy: performedBy || null,
                note
            }
        ],
        { session }
    );
};

const adjustInventoryWithLog = async ({
    transferId,
    branch,
    product,
    quantityChange,
    movementType,
    performedBy,
    note,
    session,
    upsert = false
}) => {
    const inventory = await Inventory.findOne({ branch, product }).session(session);
    const previousQuantity = inventory?.quantity || 0;
    const newQuantity = previousQuantity + quantityChange;

    if (!upsert && newQuantity < 0) {
        throw new Error(`Insufficient stock for product ${product}.`);
    }

    if (inventory) {
        inventory.quantity = newQuantity;
        await inventory.save({ session });
    } else if (upsert) {
        await Inventory.create(
            [{ branch, product, quantity: newQuantity, reservedStock: 0, lowStockAlert: false }],
            { session }
        );
    } else {
        throw new Error(`Inventory not found for product ${product}.`);
    }

    await recordInventoryMovement({
        transferId,
        branch,
        product,
        movementType,
        quantity: Math.abs(quantityChange),
        previousQuantity,
        newQuantity,
        performedBy,
        note,
        session
    });
};

const getRequestBody = (req) => req.body || {};

const isAdminRole = (role) => ["SUPER_ADMIN", "ADMIN"].includes(role);

const assertManagerOutboundRequest = (req, fromBranch) => {
	if (isAdminRole(req.user.role)) {
		return null;
	}

	if (req.user.role !== "MANAGER") {
		return "Access denied for this role.";
	}

	if (!req.user.branch) {
		return "Manager must be assigned to a branch to create transfer requests.";
	}

	if (String(fromBranch) !== String(req.user.branch)) {
		return "Managers can only create transfer requests from their own branch.";
	}

	return null;
};

const assertInboundReceiptAccess = (req, transfer) => {
	if (isAdminRole(req.user.role)) {
		return null;
	}

	if (req.user.role !== "MANAGER") {
		return "Access denied for this role.";
	}

	if (!req.user.branch) {
		return "Manager must be assigned to a branch to confirm receipt.";
	}

	if (String(transfer.toBranch) !== String(req.user.branch)) {
		return "Managers can only confirm receipt for inbound transfers to their branch.";
	}

	return null;
};

const createTransfer = async (req, res) => {
    try {
        const body = getRequestBody(req);
        const { fromBranch, toBranch, items, notes } = body;

        if (!Object.keys(body).length) {
            return res.status(400).json({
                success: false,
                message:
                    "Request body is empty. In Postman: open the Body tab → select raw → choose JSON → paste your JSON payload."
            });
        }

        if (!fromBranch || !toBranch) {
            return res.status(400).json({
                success: false,
                message: "fromBranch and toBranch are required in the JSON body."
            });
        }

        if (fromBranch === toBranch) {
            return res.status(400).json({ success: false, message: "fromBranch and toBranch must be different." });
        }

        const branchAccessError = assertManagerOutboundRequest(req, fromBranch);
        if (branchAccessError) {
            return res.status(403).json({ success: false, message: branchAccessError });
        }

        const [fromExists, toExists] = await Promise.all([
            Branch.exists({ _id: fromBranch }),
            Branch.exists({ _id: toBranch })
        ]);

        if (!fromExists || !toExists) {
            return res.status(404).json({ success: false, message: "One or both branches do not exist." });
        }

        const validationError = await validateTransferItems(items);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const availability = await checkStockAvailability(fromBranch, items);
        if (!availability.available) {
            return res.status(400).json({ success: false, message: availability.message });
        }

        const transfer = await StockTransfer.create({
            fromBranch,
            toBranch,
            items,
            notes,
            activityLogs: [
                {
                    status: "PENDING",
                    note: "Transfer created",
                    changedBy: req.user._id
                }
            ]
        });

        await createAuditLog(req, "CREATE_TRANSFER", {
            transferId: transfer._id,
            fromBranch,
            toBranch,
            itemCount: items.length
        });

        return res.status(201).json({ success: true, data: transfer });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateTransfer = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        if (transfer.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Only PENDING transfers can be updated." });
        }

        const { fromBranch, toBranch, items, notes } = getRequestBody(req);
        const nextFrom = fromBranch || transfer.fromBranch;
        const nextTo = toBranch || transfer.toBranch;
        const nextItems = items || transfer.items;

        if (String(nextFrom) === String(nextTo)) {
            return res.status(400).json({ success: false, message: "fromBranch and toBranch must be different." });
        }

        const [fromExists, toExists] = await Promise.all([
            Branch.exists({ _id: nextFrom }),
            Branch.exists({ _id: nextTo })
        ]);

        if (!fromExists || !toExists) {
            return res.status(404).json({ success: false, message: "One or both branches do not exist." });
        }

        const validationError = await validateTransferItems(nextItems);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const availability = await checkStockAvailability(nextFrom, nextItems);
        if (!availability.available) {
            return res.status(400).json({ success: false, message: availability.message });
        }

        transfer.fromBranch = nextFrom;
        transfer.toBranch = nextTo;
        transfer.items = nextItems;
        if (notes !== undefined) {
            transfer.notes = notes;
        }

        pushActivityLog(transfer, "PENDING", "Transfer updated", req.user._id);
        await transfer.save();

        await createAuditLog(req, "UPDATE_TRANSFER", { transferId: transfer._id });

        return res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTransfer = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        if (transfer.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Only PENDING transfers can be deleted." });
        }

        await StockTransfer.deleteOne({ _id: transfer._id });
        await createAuditLog(req, "DELETE_TRANSFER", { transferId: transfer._id });

        return res.status(200).json({ success: true, message: "Transfer deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const dispatchTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transfer = await StockTransfer.findById(req.params.id).session(session);

        if (!transfer) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        if (transfer.status !== "PENDING") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Only PENDING transfers can be dispatched." });
        }

        const availability = await checkStockAvailability(transfer.fromBranch, transfer.items, session);
        if (!availability.available) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: availability.message });
        }

        for (const item of transfer.items) {
            await adjustInventoryWithLog({
                transferId: transfer._id,
                branch: transfer.fromBranch,
                product: item.product,
                quantityChange: -Number(item.quantity),
                movementType: "OUT",
                performedBy: req.user._id,
                note: "Stock dispatched from source branch",
                session
            });
        }

        transfer.status = "IN_TRANSIT";
        transfer.dispatchedAt = new Date();
        pushActivityLog(transfer, "IN_TRANSIT", "Transfer dispatched", req.user._id);

        await transfer.save({ session });
        await session.commitTransaction();

        await createAuditLog(req, "DISPATCH_TRANSFER", { transferId: transfer._id });

        return res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

const completeTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transfer = await StockTransfer.findById(req.params.id).session(session);

        if (!transfer) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        if (transfer.status !== "IN_TRANSIT") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Only IN_TRANSIT transfers can be completed." });
        }

        const receiptAccessError = assertInboundReceiptAccess(req, transfer);
        if (receiptAccessError) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: receiptAccessError });
        }

        for (const item of transfer.items) {
            await adjustInventoryWithLog({
                transferId: transfer._id,
                branch: transfer.toBranch,
                product: item.product,
                quantityChange: Number(item.quantity),
                movementType: "IN",
                performedBy: req.user._id,
                note: "Stock received at destination branch",
                session,
                upsert: true
            });
        }

        transfer.status = "COMPLETED";
        transfer.completedAt = new Date();
        pushActivityLog(transfer, "COMPLETED", "Transfer completed", req.user._id);

        await transfer.save({ session });
        await session.commitTransaction();

        await createAuditLog(req, "COMPLETE_TRANSFER", { transferId: transfer._id });

        return res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

const cancelTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transfer = await StockTransfer.findById(req.params.id).session(session);
        const { reason } = getRequestBody(req);

        if (!transfer) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        if (["COMPLETED", "CANCELLED"].includes(transfer.status)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Transfer cannot be cancelled when status is ${transfer.status}.`
            });
        }

        if (transfer.status === "IN_TRANSIT") {
            for (const item of transfer.items) {
                await adjustInventoryWithLog({
                    transferId: transfer._id,
                    branch: transfer.fromBranch,
                    product: item.product,
                    quantityChange: Number(item.quantity),
                    movementType: "RESTORE",
                    performedBy: req.user._id,
                    note: "Stock restored after transfer cancellation",
                    session,
                    upsert: true
                });
            }
        }

        transfer.status = "CANCELLED";
        transfer.cancelledAt = new Date();
        transfer.cancelReason = reason || "Transfer cancelled";
        pushActivityLog(transfer, "CANCELLED", transfer.cancelReason, req.user._id);

        await transfer.save({ session });
        await session.commitTransaction();

        await createAuditLog(req, "CANCEL_TRANSFER", {
            transferId: transfer._id,
            reason: transfer.cancelReason
        });

        return res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

/** Admin progress tracking: reject a pending transfer request */
const rejectTransfer = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id);
        const { reason } = getRequestBody(req);

        if (!transfer) {
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        if (transfer.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only PENDING transfers can be rejected."
            });
        }

        transfer.status = "CANCELLED";
        transfer.cancelledAt = new Date();
        transfer.cancelReason = reason || "Transfer rejected";
        pushActivityLog(transfer, "CANCELLED", transfer.cancelReason, req.user._id);
        await transfer.save();

        await createAuditLog(req, "REJECT_TRANSFER", {
            transferId: transfer._id,
            reason: transfer.cancelReason
        });

        return res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const listTransfers = async (req, res) => {
    try {
        const filters = buildTransferFilters(req.query);
        const { page, limit, skip } = parsePagination(req.query);

        const [data, total] = await Promise.all([
            StockTransfer.find(filters)
                .populate("fromBranch", "name code")
                .populate("toBranch", "name code")
                .populate("items.product", "name barcode")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StockTransfer.countDocuments(filters)
        ]);

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTransferById = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id)
            .populate("fromBranch", "name code")
            .populate("toBranch", "name code")
            .populate("items.product", "name barcode")
            .populate("activityLogs.changedBy", "firstName lastName email");

        if (!transfer) {
            return res.status(404).json({ success: false, message: "Transfer not found." });
        }

        return res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const listInventoryMovements = async (req, res) => {
    try {
        const filters = {};

        if (req.query.transferId) {
            filters.transfer = req.query.transferId;
        }

        if (req.query.branch) {
            filters.branch = req.query.branch;
        }

        if (req.query.product) {
            filters.product = req.query.product;
        }

        const { page, limit, skip } = parsePagination(req.query);

        const [data, total] = await Promise.all([
            InventoryMovement.find(filters)
                .populate("branch", "name code")
                .populate("product", "name barcode")
                .populate("performedBy", "firstName lastName email")
                .populate("transfer", "status fromBranch toBranch")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            InventoryMovement.countDocuments(filters)
        ]);

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTransferAnalytics = async (req, res) => {
    try {
        const filters = buildTransferFilters(req.query);
        const pipeline = [{ $match: filters }];

        const [statusSummary, volumeSummary, topProducts, cancelledCount] = await Promise.all([
            StockTransfer.aggregate([
                ...pipeline,
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            StockTransfer.aggregate([
                ...pipeline,
                { $unwind: "$items" },
                {
                    $group: {
                        _id: null,
                        totalUnits: { $sum: "$items.quantity" },
                        totalTransfers: { $sum: 1 }
                    }
                }
            ]),
            StockTransfer.aggregate([
                ...pipeline,
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        quantity: { $sum: "$items.quantity" }
                    }
                },
                { $sort: { quantity: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $project: {
                        _id: 0,
                        productId: "$product._id",
                        name: "$product.name",
                        barcode: "$product.barcode",
                        quantity: 1
                    }
                }
            ]),
            StockTransfer.countDocuments({ ...filters, status: "CANCELLED" })
        ]);

        return res.status(200).json({
            success: true,
            statusSummary,
            volumeSummary: volumeSummary[0] || { totalUnits: 0, totalTransfers: 0 },
            topProducts,
            cancelledCount
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTransfer,
    updateTransfer,
    deleteTransfer,
    dispatchTransfer,
    approveTransfer: dispatchTransfer,
    completeTransfer,
    cancelTransfer,
    rejectTransfer,
    listTransfers,
    getTransferById,
    listInventoryMovements,
    getTransferAnalytics
};
