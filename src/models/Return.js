const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
{
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale"
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: Number,

            refundAmount: Number
        }
    ],

    reason: String,

    refundStatus: {
        type: String,
        enum: ["PENDING", "APPROVED", "COMPLETED"],
        default: "PENDING"
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Return", returnSchema);