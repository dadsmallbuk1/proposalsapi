// File: /netlify/functions/gemini-proxy.js

exports.handler = async function(event, context) {
    // 1. Define the allowed origin. This makes your function more secure.
    const allowedOrigin = 'https://proposals.onspirehealthmarketing.com';

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // 2. Handle the browser's preflight "OPTIONS" request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content
            headers: headers,
            body: ''
        };
    }

    // 3. We only accept POST requests for the actual API call
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: headers, body: 'Method Not Allowed' };
    }

    // 4. Get the secret API key from Netlify's environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return { statusCode: 500, headers: headers, body: 'API key not found.' };
    }

    // 5. The URL for the Gemini API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    try {
        // 6. Get the prompt from the request body sent by the frontend
        const requestBody = JSON.parse(event.body);

        // 7. Make the secure call to the Gemini API from our server
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) // Pass the original payload through
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return { statusCode: response.status, headers: headers, body: errorBody };
        }

        // 8. Get the response from Gemini and send it back to our frontend
        const data = await response.json();
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return { statusCode: 500, headers: headers, body: JSON.stringify({ error: error.message }) };
    }
};
