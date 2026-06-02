const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
{
    firstName: String,
    lastName: String,

    email: {
        type: String,
        unique: true
    },

    phone: String,

    loyaltyPoints: {
        type: Number,
        default: 0
    },

    totalPurchases: {
        type: Number,
        default: 0
    },

    preferredBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);