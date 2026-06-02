const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
{
    companyName: String,

    contactPerson: String,

    email: String,

    phone: String,

    address: String,

    contractStartDate: Date,

    contractEndDate: Date,

    rating: {
        type: Number,
        default: 5
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);