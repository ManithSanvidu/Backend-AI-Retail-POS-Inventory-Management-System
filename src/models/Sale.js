const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
{
    invoiceNumber: {
        type: String,
        unique: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },

    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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

            price: Number,

            discount: Number
        }
    ],

    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "ONLINE"]
    },

    totalAmount: Number,

    taxAmount: Number,

    finalAmount: Number
},
{ timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);