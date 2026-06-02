const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema(
{
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    predictedDemand: Number,

    forecastPeriod: String,

    confidenceScore: Number
},
{ timestamps: true }
);

module.exports = mongoose.model("Forecast", forecastSchema);