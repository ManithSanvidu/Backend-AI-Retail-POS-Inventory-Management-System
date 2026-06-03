const supplierService = require("../services/supplierService");

// CREATE
exports.createSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.createSupplier(req.body);

        return res.status(201).json({
            success: true,
            message: "Supplier created",
            data
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next(err);
    }
};

// GET ALL
exports.getSuppliers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const category = req.query.category || "";
        const status = req.query.status || "";
        
        const data = await supplierService.getAllSuppliers(search, category, status);

        return res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        next(err);
    }
};

// GET ONE
exports.getSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.getSupplierById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        return res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

// UPDATE
exports.updateSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.updateSupplier(
            req.params.id,
            req.body
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        return res.json({
            success: true,
            message: "Supplier updated",
            data
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next(err);
    }
};

// DELETE
exports.deleteSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.deleteSupplier(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        return res.json({
            success: true,
            message: "Supplier deleted"
        });

    } catch (err) {
        next(err);
    }
};
