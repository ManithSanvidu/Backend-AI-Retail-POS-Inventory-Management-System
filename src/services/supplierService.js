const Supplier = require("../models/Supplier");

class SupplierService {
    // CREATE SUPPLIER
    async createSupplier(data) {
        return await Supplier.create(data);
    }

    // GET ALL SUPPLIERS + SEARCH & FILTER
    async getAllSuppliers(search = "", category = "", status = "") {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState !== 1) {
            return [];
        }

        const query = {};

        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: "i" } },
                { contactPerson: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        return await Supplier.find(query).sort({ createdAt: -1 });
    }

    // GET ONE SUPPLIER
    async getSupplierById(id) {
        return await Supplier.findById(id);
    }

    // UPDATE SUPPLIER
    async updateSupplier(id, data) {
        return await Supplier.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
    }

    // DELETE SUPPLIER
    async deleteSupplier(id) {
        return await Supplier.findByIdAndDelete(id);
    }
}

module.exports = new SupplierService();
