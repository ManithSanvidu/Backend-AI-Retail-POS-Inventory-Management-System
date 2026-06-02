const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Helper to generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret_key", {
        expiresIn: "30d"
    });
};

/**
 * Register a new employee/user
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone, role, branch } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error: "User already exists with this email address"
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            branch
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: "Invalid user data provided"
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Login user and retrieve token
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Using simple text comparison for our initial dev/seed setups if bcrypt isn't fully matched,
        // but User.js pre-save hook handles hashing properly, so we check using bcrypt
        const bcrypt = require("bcryptjs");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                branch: user.branch,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser
};
