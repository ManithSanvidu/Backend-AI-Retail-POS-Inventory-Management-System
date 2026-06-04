const express = require('express');
const router = express.Router();
const { getPromotions, createPromotion } = require('../controllers/promotionController');
const { requireMongoConnection } = require('../middleware/requireMongoConnection');

router.use(requireMongoConnection);

router.get('/', getPromotions);
router.post('/', createPromotion);

module.exports = router;
