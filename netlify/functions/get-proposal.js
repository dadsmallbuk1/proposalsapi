const admin = require('firebase-admin');

// Log environment variables to check if they exist at the start
console.log('Function Loaded: get-proposal');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Exists' : 'MISSING!');
console.log('FIREBASE_SERVICE_ACCOUNT_BASE64:', process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ? 'Exists' : 'MISSING!');

let db;

// Initialize Firebase Admin SDK
try {
    if (!admin.apps.length) {
        const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (!serviceAccountBase64) {
            throw new Error('Firebase service account key NOT FOUND in environment variables.');
        }
        const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        console.log('Firebase Admin Initialized Successfully for get-proposal.');
    }
    db = admin.firestore();
} catch (error) {
    console.error("CRITICAL: Firebase Admin initialization failed:", error);
}

exports.handler = async function(event, context) {
    const allowedOrigin = '[https://proposals.onspirehealthmarketing.com](https://proposals.onspirehealthmarketing.com)';
    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    // If Firebase failed to initialize, return a clear server error.
    if (!db) {
        console.error("Firestore database is not available. Initialization likely failed.");
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server configuration error: Could not connect to the database.' })
        };
    }
    
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    const proposalId = event.queryStringParameters.id;

    if (!proposalId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing proposal ID' }) };
    }

    try {
        const docRef = db.collection('proposals').doc(proposalId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Proposal not found' }) };
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
            body: JSON.stringify({ error: 'Failed to fetch proposal data.' }),
        };
    }
};

