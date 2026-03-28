require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminHackathonRoutes = require('./routes/adminHackathonRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const { registerChatHandlers } = require('./socket/chatHandlers');
const { syncDatabase } = require('./models');

const app = express();
const server = http.createServer(app);
const shouldEnableFirebaseAuth =
  process.env.ENABLE_FIREBASE_AUTH === 'true' || process.env.NODE_ENV === 'production';

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.SOCKET_CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS not allowed'));
    },
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.set('io', io);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CodeCollab API',
    version: '1.0.0',
    status: 'active',
  });
});

// Import routes here (uncomment when routes are created)
// const userRoutes = require('./routes/userRoutes');
// const hackathonRoutes = require('./routes/hackathonRoutes');
// const matchingRoutes = require('./routes/matchingRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');
// const messageRoutes = require('./routes/messageRoutes');

if (shouldEnableFirebaseAuth) {
  const profileRoutes = require('./routes/profileRoutes');
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profile', profileRoutes);
} else {
  console.log('⚠️  Firebase user auth routes disabled (ENABLE_FIREBASE_AUTH=false).');
}

// Use routes (uncomment when routes are created)
// app.use('/api/users', userRoutes);
// app.use('/api/hackathons', hackathonRoutes);
// app.use('/api/matching', matchingRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/messages', messageRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/hackathons', adminHackathonRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/v1/hackathons', hackathonRoutes);

registerChatHandlers(io);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
});

const PORT = process.env.PORT || 5000;
syncDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });

module.exports = { app, server, io };
