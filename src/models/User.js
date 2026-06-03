const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
{
    firstName: String,
    lastName: String,

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: String,

    role: {
        type: String,
        enum: [
            "SUPER_ADMIN",
            "ADMIN",
            "MANAGER",
            "CASHIER",
            "EMPLOYEE"
        ],
        default: "EMPLOYEE"
    },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: Date
},
{ timestamps: true }
);

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
