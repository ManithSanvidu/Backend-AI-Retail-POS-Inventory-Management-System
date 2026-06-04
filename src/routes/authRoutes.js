const express = require('express');
const {
	register,
	login,
	forgotPassword,
	resetPassword,
	getProfile,
	updateProfile,
} = require('../controllers/authcontroller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.get(
	'/admin-data',
	protect,
	authorizeRoles('SUPER_ADMIN', 'ADMIN'),
	(req, res) => {
		res.json({ success: true, message: 'Admin only data' });
	},
);

router.get(
	'/manager-data',
	protect,
	authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
	(req, res) => {
		res.json({ success: true, message: 'Admin and manager data' });
	},
);

module.exports = router;
