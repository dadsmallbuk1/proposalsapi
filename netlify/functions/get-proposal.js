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
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
    
  if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const proposalId = event.queryStringParameters.id;

  if (!proposalId) {
    return { statusCode: 400, body: 'Missing proposal ID' };
  }

  try {
    const docRef = db.collection('proposals').doc(proposalId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { statusCode: 404, headers, body: 'Proposal not found' };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(doc.data()),
    };
  } catch (error) {
    console.error('Error fetching from Firestore:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch proposal.' }),
    };
  }
};
