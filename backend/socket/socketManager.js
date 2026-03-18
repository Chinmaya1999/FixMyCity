const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a room for specific issue updates
    socket.on('join-issue', (issueId) => {
      socket.join(`issue-${issueId}`);
      console.log(`Socket ${socket.id} joined issue-${issueId}`);
    });

    socket.on('leave-issue', (issueId) => {
      socket.leave(`issue-${issueId}`);
      console.log(`Socket ${socket.id} left issue-${issueId}`);
    });

    // Join location-based room for nearby updates
    socket.on('join-location', (location) => {
      socket.join(`location-${location}`);
      console.log(`Socket ${socket.id} joined location-${location}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ issueId, isTyping }) => {
      socket.to(`issue-${issueId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = socketManager;