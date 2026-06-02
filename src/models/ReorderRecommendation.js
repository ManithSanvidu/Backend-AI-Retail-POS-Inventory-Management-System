const mongoose = require("mongoose");

const reorderSchema = new mongoose.Schema(
{
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    recommendedQuantity: Number,

    currentStock: Number,

    reorderPoint: Number,

    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("ReorderRecommendation", reorderSchema);