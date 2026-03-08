# Server Source Directory Structure

This directory contains the Node.js backend application.

## Directory Structure

```
src/
├── config/          # Configuration files
│   ├── database.js  # Database connection
│   ├── firebase.js  # Firebase Admin SDK setup
│   └── migrate.js   # Database migration script
├── controllers/     # Route controllers (business logic)
│   ├── authController.js
│   ├── userController.js
│   ├── hackathonController.js
│   ├── matchingController.js
│   ├── reviewController.js
│   └── messageController.js
├── models/          # Database models (Sequelize)
│   ├── User.js
│   ├── Hackathon.js
│   ├── Review.js
│   ├── Match.js
│   └── Message.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── hackathonRoutes.js
│   ├── matchingRoutes.js
│   ├── reviewRoutes.js
│   └── messageRoutes.js
├── middleware/      # Express middleware
│   ├── authMiddleware.js
│   ├── validateMiddleware.js
│   └── errorMiddleware.js
├── services/        # Business logic services
│   ├── matchingService.js
│   ├── emailService.js
│   └── externalApiService.js
├── utils/           # Helper functions
│   ├── validators.js
│   └── helpers.js
└── app.js           # Main application file
```

## API Structure

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get specific user
- `POST /api/users/skills` - Add/update skills

### Hackathon Endpoints
- `GET /api/hackathons` - List all hackathons
- `GET /api/hackathons/:id` - Get specific hackathon
- `POST /api/hackathons/bookmark` - Bookmark a hackathon
- `GET /api/hackathons/search` - Search hackathons

### Matching Endpoints
- `GET /api/matching/discover` - Get potential matches
- `POST /api/matching/swipe` - Swipe on a user
- `GET /api/matching/matches` - Get matched users
- `POST /api/matching/invite` - Invite user to team

### Review Endpoints
- `POST /api/reviews` - Create a review
- `GET /api/reviews/user/:id` - Get reviews for a user
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### Message Endpoints
- `GET /api/messages` - Get all conversations
- `GET /api/messages/:conversationId` - Get messages in conversation
- `POST /api/messages` - Send a message
- `DELETE /api/messages/:id` - Delete a message

## Socket.io Events

### Client → Server
- `join_conversation` - Join a conversation room
- `send_message` - Send a real-time message
- `typing` - User is typing
- `read_message` - Mark message as read

### Server → Client
- `new_message` - Receive a new message
- `user_typing` - Someone is typing
- `message_read` - Message was read
- `user_online` - User came online
- `user_offline` - User went offline
