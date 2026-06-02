const mongoose = require("mongoose");

const stockTransferSchema = new mongoose.Schema(
{
    fromBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    toBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: Number
        }
    ],

    status: {
        type: String,
        enum: [
            "PENDING",
            "IN_TRANSIT",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "PENDING"
    },

    transferDate: {
        type: Date,
        default: Date.now
    },

    dispatchedAt: Date,

    completedAt: Date,

    cancelledAt: Date,

    cancelReason: String,

    notes: String,

    activityLogs: [
        {
            status: {
                type: String,
                enum: ["PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED"]
            },
            note: String,
            changedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            changedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},
{ timestamps: true }
);

module.exports = mongoose.model("StockTransfer", stockTransferSchema);