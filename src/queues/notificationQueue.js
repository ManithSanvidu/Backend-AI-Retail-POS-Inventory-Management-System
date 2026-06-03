const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URI, {
	maxRetriesPerRequest: null,
	tls: {
		rejectUnauthorized: false,
	},
});

const notificationQueue = new Queue('NotificationQueue', { connection });

console.log('✅ BullMQ NotificationQueue initialized');

module.exports = notificationQueue;
