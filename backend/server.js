const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');
const eventRoutes = require('./routes/event.routes');
const jobRoutes = require('./routes/job.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-network')
  .then(() => {
    console.log('MongoDB connected');
    global.mongodbDisconnected = false;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Running in development mode without MongoDB. Some features will not work.');
    // Set global flag to indicate MongoDB is disconnected
    global.mongodbDisconnected = true;
    // Don't exit the process in development mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/webhooks', webhookRoutes);

// Socket.io connection
require('./config/socket')(io);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});