# Middleware Directory

Express middleware for request processing.

## Structure

```
middleware/
├── authMiddleware.js      # JWT authentication
├── validateMiddleware.js  # Request validation
├── errorMiddleware.js     # Error handling
└── rateLimitMiddleware.js # Rate limiting
```

## Example: `authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');

// JWT authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = { id: decodedToken.uid, email: decodedToken.email };
      next();
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
```

## Example: `errorMiddleware.js`

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => e.message)
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
};

module.exports = errorHandler;
```

## Usage in Routes

```javascript
const authMiddleware = require('../middleware/authMiddleware');

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```
