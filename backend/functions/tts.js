/**
 * Firebase Callable Cloud Function for Text-to-Speech using Kokoro TTS (Python microservice).
 * 1. Verifies user authentication.
 * 2. Sends text to your local or deployed Python FastAPI TTS service.
 * 3. Returns Base64 audio as JSON (same structure as before).
 */

const functions = require("firebase-functions");
const fetch = require("node-fetch");
const {verifyAuth} = require("./src/utils/auth");

// --- Configuration ---
const KOKORO_TTS_URL = process.env.KOKORO_TTS_URL || "http://localhost:8080/tts";

// --- Callable Cloud Function Definition ---
exports.generateTTS = functions.https.onCall(async (data, context) => {
  // 1. Verify Authentication
  const uid = verifyAuth(context);
  console.log(`Kokoro TTS request from authenticated user: ${uid}`);

  // 2. Validate Input
  const text = data.text;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a non-empty string \"text\" argument.",
    );
  }

  // 3. Call the Kokoro FastAPI microservice
  try {
    console.log(`Sending text to Kokoro TTS service: "${text.substring(0, 60)}..."`);
    const response = await fetch(KOKORO_TTS_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({text}),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Kokoro TTS service error (${response.status}): ${errText}`);
      throw new Error(`Kokoro TTS service returned ${response.status}`);
    }

    const result = await response.json();

    // Expecting { "audio_base64": "...", "mime_type": "audio/wav" }
    if (!result.audio_base64) {
      console.error("Invalid response from Kokoro TTS service:", result);
      throw new Error("Kokoro TTS service did not return audio data.");
    }

    console.log("Successfully received Base64 audio from Kokoro TTS.");

    // Return directly to the frontend
    return {
      audio_base64: result.audio_base64,
      mime_type: result.mime_type || "audio/wav",
    };
  } catch (error) {
    console.error("Error calling Kokoro TTS service:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to generate speech. Please try again later.",
    );
  }
});
