const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
{
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    quantity: {
        type: Number,
        default: 0
    },

    reservedStock: {
        type: Number,
        default: 0
    },

    lowStockAlert: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);