const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
{
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: Number,

            costPrice: Number
        }
    ],

    status: {
        type: String,
        enum: [
            "PENDING",
            "APPROVED",
            "RECEIVED",
            "CANCELLED"
        ],
        default: "PENDING"
    },

    totalAmount: Number
},
{ timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);