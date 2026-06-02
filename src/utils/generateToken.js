const jwt = require("jsonwebtoken");

/**
 * Generates a signed JSON Web Token
 * @param {string} id - The Mongoose User document ID
 * @returns {string} The signed JWT token
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || "default_jwt_secret_key",
        { expiresIn: "30d" }
    );
};

module.exports = generateToken;
