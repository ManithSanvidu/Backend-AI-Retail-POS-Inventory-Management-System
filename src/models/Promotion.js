const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
{
    title: String,

    description: String,

    discountType: {
        type: String,
        enum: ["PERCENTAGE", "FIXED"]
    },

    discountValue: Number,

    startDate: Date,

    endDate: Date,

    applicableProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],

    couponCode: String,

    isActive: {
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);