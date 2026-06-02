const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../utils/emailSender");

exports.register = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role
        });

        return res.status(201).json({
            success: true,
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled."
            });
        }

        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user with that email."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const html = `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 30 minutes.</p>
        `;

        await sendEmail(user.email, "Password Reset Request", `Reset your password: ${resetUrl}`, html);

        return res.json({
            success: true,
            message: "Reset email sent."
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.json({
            success: true,
            message: "Password reset successful."
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const user = await User.findById(req.user._id);

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();

        return res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
