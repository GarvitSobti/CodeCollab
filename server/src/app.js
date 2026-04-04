require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminHackathonRoutes = require('./routes/adminHackathonRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const teamRoutes = require('./routes/teamRoutes');
const discoverRoutes = require('./routes/discoverRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { registerChatHandlers } = require('./socket/chatHandlers');

const shouldEnableFirebaseAuth =
  process.env.ENABLE_FIREBASE_AUTH === 'true' || process.env.NODE_ENV === 'production';

function collectAllowedOrigins() {
  const envOrigins = [
    process.env.CORS_ORIGIN,
    process.env.SOCKET_CORS_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  const vercelOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
  ].filter(Boolean);

  return [
    ...envOrigins,
    ...vercelOrigins,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return collectAllowedOrigins().includes(origin);
}

function createNoopIo() {
  return {
    emit() {},
    on() {},
    to() {
      return {
        emit() {},
      };
    },
  };
}

function createApp() {
  const app = express();
  app.set('io', createNoopIo());

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

  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to CodeCollab API',
      version: '1.0.0',
      status: 'active',
      runtime: process.env.VERCEL ? 'vercel' : 'node',
    });
  });

  if (shouldEnableFirebaseAuth) {
    app.use('/api/v1/auth', authRoutes);
  } else {
    console.log('Firebase user auth routes disabled (ENABLE_FIREBASE_AUTH=false).');
  }

  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/v1/messages', messageRoutes);
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/admin/hackathons', adminHackathonRoutes);
  app.use('/api/admin/analytics', adminAnalyticsRoutes);
  app.use('/api/v1/hackathons', hackathonRoutes);
  app.use('/api/v1/teams', teamRoutes);
  app.use('/api/v1/discover', discoverRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

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

  return app;
}

function attachRealtimeServer(app, server) {
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

  app.set('io', io);
  registerChatHandlers(io);
  return io;
}

function createServer() {
  const app = createApp();
  const server = http.createServer(app);
  const io = attachRealtimeServer(app, server);
  return { app, server, io };
}

if (require.main === module) {
  const { server } = createServer();
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = {
  createApp,
  createServer,
  attachRealtimeServer,
};
