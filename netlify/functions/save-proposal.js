const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountBase64) {
    throw new Error('Firebase service account key not found in environment variables.');
  }
  const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const db = admin.firestore();

exports.handler = async function(event, context) {
  const allowedOrigin = 'https://proposals.onspirehealthmarketing.com';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const docRef = await db.collection('proposals').add(data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: docRef.id }),
    };
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save proposal.' }),
    };
  }
};
