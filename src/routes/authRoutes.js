const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authcontroller");

// Route: POST /api/auth/register - Register a user profile
router.post("/register", registerUser);

// Route: POST /api/auth/login - Retrieve session token
router.post("/login", loginUser);

module.exports = router;
