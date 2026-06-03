/**
 * Setup notification socket events
 * Dummy implementation to prevent module not found errors on startup
 */
module.exports = (io) => {
  io.on("connection", (socket) => {
    // Can listen to notification-specific events here if needed
  });
};
