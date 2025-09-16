const admin = require('firebase-admin');

// Function to initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
    // Check if the app is already initialized to prevent errors
    if (admin.apps.length === 0) {
        try {
            // Get credentials from environment variables
            const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
            const projectId = process.env.FIREBASE_PROJECT_ID;

            if (!serviceAccountBase64 || !projectId) {
                throw new Error('Firebase credentials are not set in the environment variables.');
            }

            // Decode the Base64 service account key
            const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
            const serviceAccount = JSON.parse(serviceAccountJson);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: projectId,
            });
        } catch (error) {
            console.error('Firebase Admin SDK initialization error:', error);
            // Re-throw the error to be caught by the handler
            throw new Error(`Firebase initialization failed: ${error.message}`);
        }
    }
    return admin.firestore();
}

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': 'https://proposals.onspirehealthmarketing.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const db = initializeFirebaseAdmin();
        const data = JSON.parse(event.body);

        // Simple validation to ensure we're not saving empty data
        if (!data || !data.clientName) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Client name is required.' }) };
        }
        
        const docRef = await db.collection('proposals').add(data);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ id: docRef.id }),
        };
    } catch (error) {
        console.error('Error in save-proposal function:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }) };
    }
};

