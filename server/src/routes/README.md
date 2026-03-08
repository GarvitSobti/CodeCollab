# Routes Directory

API route definitions using Express Router.

## Structure

```
routes/
├── authRoutes.js        # Authentication endpoints
├── userRoutes.js        # User management endpoints
├── hackathonRoutes.js   # Hackathon endpoints
├── matchingRoutes.js    # Matching endpoints
├── reviewRoutes.js      # Review endpoints
└── messageRoutes.js     # Messaging endpoints
```

## Route Pattern

### Example: `userRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Get user profile (protected)
router.get(
  '/profile',
  authMiddleware,
  userController.getUserProfile
);

// Update user profile (protected)
router.put(
  '/profile',
  authMiddleware,
  [
    body('bio').optional().trim().isLength({ max: 500 }),
    body('githubUsername').optional().trim().isLength({ max: 100 }),
    body('linkedinUsername').optional().trim().isLength({ max: 100 })
  ],
  userController.updateUserProfile
);

// Get user by ID (public)
router.get(
  '/:id',
  authMiddleware,
  userController.getUserById
);

module.exports = router;
```

### Example: `authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  authController.login
);

// Verify token
router.get('/verify', authController.verifyToken);

module.exports = router;
```

## Mounting Routes in `app.js`

```javascript
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
```

## Route Naming Conventions

- Use plural nouns: `/users`, `/hackathons`
- Use HTTP verbs appropriately:
  - `GET` - Retrieve data
  - `POST` - Create new resource
  - `PUT` - Update entire resource
  - `PATCH` - Partial update
  - `DELETE` - Remove resource
- Use IDs in URL: `/users/:id`
- Use query params for filters: `/hackathons?difficulty=beginner`
