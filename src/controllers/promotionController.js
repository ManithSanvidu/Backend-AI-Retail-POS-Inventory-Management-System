const Promotion = require('../models/Promotion');
const systemEvents = require('../events/eventBus');
const { isMongoConnected } = require('../middleware/requireMongoConnection');

const dbUnavailable = (res) =>
	res.status(503).json({
		success: false,
		message:
			'MongoDB is not connected. Set MONGO_URI in .env and ensure Atlas/network access.',
	});

exports.getPromotions = async (req, res, next) => {
	try {
		if (!isMongoConnected()) {
			return dbUnavailable(res);
		}
		const promotions = await Promotion.find();
		res.json(promotions);
	} catch (err) {
		next(err);
	}
};

exports.createPromotion = async (req, res, next) => {
	try {
		if (!isMongoConnected()) {
			return dbUnavailable(res);
		}
		const promotion = new Promotion(req.body);
		await promotion.save();

		systemEvents.emit('SEND_ALERT', {
			target: { role: 'Manager' },
			category: 'SYSTEM',
			type: 'INFO',
			title: 'New Promotion Launched',
			message: `A new promotion "${promotion.name || 'Special Offer'}" has been created!`,
			channels: ['in-app', 'email'],
		});

		res.status(201).json(promotion);
	} catch (err) {
		next(err);
	}
};
