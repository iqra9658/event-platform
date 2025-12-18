const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL;

    // 🔍 DEBUG: check if env variable is actually loading
    console.log("🔍 Mongo URI exists:", !!process.env.MONGO_URI);

    if (!mongoURI) {
      throw new Error('MongoDB URI not configured in environment variables');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      tls: true,
    });

    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('🚨 Failed to connect to MongoDB. Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
    return;
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventsRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 Listening on all interfaces (0.0.0.0:${PORT})`);
  });

  server.on('error', (err) => {
    console.error('❌ Server listen error:', err.message, err.code);
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} is already in use`);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close();
    process.exit(0);
  });
};

startServer();
