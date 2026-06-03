const setupNotificationSockets = (io) => {
  // Notification namespace
  const notifNS = io.of("/notifications");

  notifNS.on("connection", (socket) => {
    console.log(`Notification socket connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on("subscribeNotifications", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        socket.emit("subscribed", { userId, message: "Subscribed to notifications" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Notification socket disconnected: ${socket.id}`);
    });
  });

  //  emit notification to a specific user
  io.emitToUser = (userId, event, data) => {
    io.of("/notifications").to(`user_${userId}`).emit(event, data);
  };

  //  broadcast to all connected clients
  io.broadcastNotification = (event, data) => {
    io.of("/notifications").emit(event, data);
  };
};

module.exports = setupNotificationSockets;
