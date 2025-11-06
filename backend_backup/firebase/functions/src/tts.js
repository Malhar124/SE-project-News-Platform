/**
 * Firebase Callable Cloud Function for Text-to-Speech using ElevenLabs.
 * 1. Verifies user authentication.
 * 2. Takes text input.
 * 3. Calls the ElevenLabs API to generate speech.
 * 4. Returns the audio as a Base64-encoded string in a JSON object.
 */

const functions = require("firebase-functions");
// Use node-fetch (v2) for CommonJS compatibility in Cloud Functions
const fetch = require("node-fetch"); 
const { verifyAuth } = require("./utils/auth"); // Your auth helper

// --- Configuration ---
// Get the API key from Firebase Function Configuration
// Set this by running in your terminal:
// firebase functions:config:set elevenlabs.key="YOUR_API_KEY"
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_KEY;

// You can find your Voice ID on the 'Voices' page of the ElevenLabs website.
// This ID (21m00Tcm4TlvDq8ikWAM) is for "Rachel", a popular default voice.
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

// --- Callable Cloud Function Definition ---
exports.generateTTS = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    // This function throws an error if the user is not authenticated.
    const uid = verifyAuth(context);
    console.log(`TTS request from authenticated user: ${uid}`);

    // 2. Validate Input
    const text = data.text;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a non-empty string "text" argument.');
    }
    if (!ELEVENLABS_API_KEY) {
         console.error("FATAL: ELEVENLABS_KEY function environment variable not set.");
         console.log("Run: firebase functions:config:set elevenlabs.key=\"YOUR_API_KEY\"");
         throw new functions.https.HttpsError('internal', 'TTS service is not configured.');
    }

    // 3. Call the ElevenLabs API
    let audioBuffer;
    try {
        console.log(`Calling ElevenLabs API for text: "${text.substring(0, 50)}..."`);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg', // Request MP3 audio
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2", // A high-quality, versatile model
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            // ElevenLabs sends helpful JSON error messages
            const errorBody = await response.json(); 
            console.error(`Error from ElevenLabs API (${response.status}):`, errorBody);
            throw new Error(`ElevenLabs API Error: ${errorBody.detail.message || response.statusText}`);
        }

        // Get the audio data as a raw Node.js Buffer
        audioBuffer = await response.buffer();
        console.log("Successfully received audio stream from ElevenLabs.");

    } catch (error) {
        console.error("Error calling ElevenLabs API:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate speech. Please try again later.');
    }

    // 4. Convert the audio buffer to Base64
    // This makes it easy to send in a JSON response
    const audio_base64 = audioBuffer.toString('base64');

    // 5. Return the Base64-encoded audio to the client
    return {
        audio_base64: audio_base64,
        mime_type: "audio/mpeg" // The format we requested and received
    };
});