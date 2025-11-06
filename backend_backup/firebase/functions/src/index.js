/**
 * Main entry point for all Firebase Cloud Functions.
 * This file imports and exports all functions defined in other files.
 * This is the *only* file Firebase looks at to find your functions.
 */

// --- Profile Functions ---
// Import all exports from profile.js (getUserProfile, updateUserProfile, etc.)
const profileFunctions = require("./profile");
exports.getUserProfile = profileFunctions.getUserProfile;
exports.updateUserProfile = profileFunctions.updateUserProfile;
exports.bookmarkArticle = profileFunctions.bookmarkArticle;
exports.removeBookmark = profileFunctions.removeBookmark;

// --- Search Function (Keyword Search) ---
// Import and export the semanticSearch function
const { semanticSearch } = require("./search");
exports.semanticSearch = semanticSearch;

// --- Text-to-Speech (TTS) Function ---
// Import and export the generateTTS function
const { generateTTS } = require("./tts");
exports.generateTTS = generateTTS;

console.log("All functions loaded and exported.");