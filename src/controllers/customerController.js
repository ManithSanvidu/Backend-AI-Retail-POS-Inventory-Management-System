const customerService = require("../services/customerService");

// CREATE
exports.createCustomer = async (req, res) => {
    try {
        const data = await customerService.createCustomer(req.body);

        return res.status(201).json({
            success: true,
            message: "Customer created",
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET ALL
exports.getCustomers = async (req, res) => {
    try {
        const search = req.query.search || "";
        const data = await customerService.getAllCustomers(search);

        return res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET ONE
exports.getCustomer = async (req, res) => {
    try {
        const data = await customerService.getCustomerById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.json({
            success: true,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
    try {
        const data = await customerService.updateCustomer(
            req.params.id,
            req.body
        );

        return res.json({
            success: true,
            message: "Customer updated",
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
    try {
        await customerService.deleteCustomer(req.params.id);

        return res.json({
            success: true,
            message: "Customer deleted"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/* // PURCHASE HISTORY
exports.purchaseHistory = async (req, res) => {
    try {
        const data = await customerService.getPurchaseHistory(req.params.id);

        return res.json({
            success: true,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ANALYTICS
exports.analytics = async (req, res) => {
    try {
        const data = await customerService.getAnalytics();

        return res.json({
            success: true,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};  */