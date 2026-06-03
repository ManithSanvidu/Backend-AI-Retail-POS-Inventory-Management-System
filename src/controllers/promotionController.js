const Promotion = require('../models/Promotion');

exports.getPromotions = async (req, res, next) => {
	try {
		const promotions = await Promotion.find();
		res.json(promotions);
	} catch (err) {
		next(err);
	}
};

exports.createPromotion = async (req, res, next) => {
	try {
		const promotion = new Promotion(req.body);
		await promotion.save();
		res.status(201).json(promotion);
	} catch (err) {
		next(err);
	}
};
