// --- FOR DEBUGGING ONLY ---
// This version bypasses Netlify's environment variables to test the API key directly.
// IMPORTANT: REVERT TO THE ORIGINAL VERSION AFTER TESTING.

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

    // --- TEMPORARY HARDCODED KEY FOR TESTING ---
    const GEMINI_API_KEY = "AIzaSyBPgD9CjgrPpJ8QtuEi1Nb1yLNg7Z25hiM"; 
    // ^^^^ REPLACE THE TEXT IN QUOTES WITH YOUR ACTUAL API KEY ^^^^

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyBPgD9CjgrPpJ8QtuEi1Nb1yLNg7Z25hiM") {
         return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key is not set in the debug file.' }) };
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const requestBody = JSON.parse(event.body);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            // Log the actual error from Google for debugging
            console.error("Google API Error:", errorBody);
            return { statusCode: response.status, headers, body: errorBody };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Error in debug function:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};

