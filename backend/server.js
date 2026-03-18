const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');

// Import socket manager
const socketManager = require('./socket/socketManager');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Initialize socket manager
socketManager(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});