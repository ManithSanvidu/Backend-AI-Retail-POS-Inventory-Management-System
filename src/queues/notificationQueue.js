const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisUri = process.env.REDIS_URI;
const notificationsEnabled = process.env.ENABLE_NOTIFICATION_WORKER === 'true';

const createDisabledQueue = (reason) => {
  console.warn(reason);
  return {
    add: async () => {
      console.warn('Notification queue disabled. Job discarded.');
    },
  };
};

let notificationQueue;

if (!notificationsEnabled) {
  notificationQueue = createDisabledQueue(
    'Notification queue disabled because ENABLE_NOTIFICATION_WORKER is not true.',
  );
} else if (!redisUri) {
  notificationQueue = createDisabledQueue(
    'REDIS_URI not configured. Notification queue is disabled.',
  );
} else {
  const connection = new IORedis(redisUri, {
    maxRetriesPerRequest: null,
  });

  connection.on('error', (error) => {
    console.warn(`Redis connection error for NotificationQueue: ${error.message}`);
  });

  notificationQueue = new Queue('NotificationQueue', { connection });
  console.log('BullMQ NotificationQueue initialized');
}

module.exports = notificationQueue;
