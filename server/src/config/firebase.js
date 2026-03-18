const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

const hasFirebaseAdminConfig = Boolean(
  serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email
);

let firebaseAdmin = admin;

if (!hasFirebaseAdminConfig) {
  console.warn('Firebase Admin env vars are missing. Authenticated backend routes will reject requests until FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are configured.');
  firebaseAdmin = {
    auth() {
      return {
        async verifyIdToken() {
          throw new Error('Firebase Admin credentials are not configured on the server');
        },
      };
    },
    apps: [],
  };
} else if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin initialized successfully');
}

module.exports = firebaseAdmin;
