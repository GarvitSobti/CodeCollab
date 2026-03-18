const admin = require('../config/firebase');

async function verifySocketUser(socket) {
  const authHeader = socket.handshake.headers.authorization;
  const rawToken = socket.handshake.auth?.token
    || (authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null);

  if (!rawToken) {
    throw new Error('Missing auth token');
  }

  const decodedToken = await admin.auth().verifyIdToken(rawToken);

  return {
    uid: decodedToken.uid,
    email: decodedToken.email || null,
    name: decodedToken.name || null,
    picture: decodedToken.picture || null,
    claims: decodedToken,
  };
}

module.exports = { verifySocketUser };
