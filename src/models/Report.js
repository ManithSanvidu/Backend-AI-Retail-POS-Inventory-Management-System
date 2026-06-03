const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
{
    title: String,

    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: String,

    fileUrl: String,

    generatedAt: Date
},
{ timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);