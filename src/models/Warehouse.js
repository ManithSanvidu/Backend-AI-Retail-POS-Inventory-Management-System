const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
{
    name: String,

    location: String,

    capacity: Number,

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);