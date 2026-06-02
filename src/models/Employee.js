const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
{
    employeeId: {
        type: String,
        unique: true
    },

    firstName: String,
    lastName: String,

    email: String,

    phone: String,

    role: String,

    salary: Number,

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    joiningDate: Date,

    attendance: [
        {
            date: Date,
            status: {
                type: String,
                enum: ["PRESENT", "ABSENT", "LEAVE"]
            }
        }
    ]
},
{ timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);