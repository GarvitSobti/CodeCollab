const admin = require('../config/firebase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing or invalid authorization header',
          status: 401,
        },
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Missing Firebase ID token',
          status: 401,
        },
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.auth = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      claims: decodedToken,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Invalid or expired Firebase ID token',
        status: 401,
      },
    });
  }
}

module.exports = authMiddleware;