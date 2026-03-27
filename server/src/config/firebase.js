const admin = require('firebase-admin');
require('dotenv').config();

function looksLikePemKey(value) {
  return typeof value === 'string' && value.includes('BEGIN PRIVATE KEY') && value.includes('END PRIVATE KEY');
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!admin.apps.length) {
  try {
    if (projectId && clientEmail && looksLikePemKey(privateKey)) {
      admin.initializeApp({
        credential: admin.credential.cert({
          type: 'service_account',
          project_id: projectId,
          private_key: privateKey,
          client_email: clientEmail,
        }),
      });
      console.log('✅ Firebase Admin initialized with service account cert');
    } else {
      admin.initializeApp({ projectId });
      console.warn('⚠️ Firebase Admin initialized without private key cert. Ensure FIREBASE_PRIVATE_KEY is valid for full auth operations.');
    }
  } catch (error) {
    console.error('❌ Firebase Admin init failed:', error.message);
    admin.initializeApp({ projectId });
    console.warn('⚠️ Falling back to project-only Firebase Admin init.');
  }
}

module.exports = admin;
