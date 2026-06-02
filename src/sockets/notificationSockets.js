const setupNotificationSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);

    // Expect the frontend to emit 'join' with their user ID upon connecting
    socket.on('join', (userId) => {
      socket.join(userId.toString());
      console.log(`[Socket.IO] User ${userId} joined their personal notification room`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupNotificationSockets;
