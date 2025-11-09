/**
 * Main entry point for all Firebase Cloud Functions.
 * This file imports and exports all functions defined in other files.
 * Firebase only looks at this file for function exports.
 */

const {setGlobalOptions} = require("firebase-functions");

// Optional: control scaling for cost
setGlobalOptions({maxInstances: 10});

// --- Import and Export User Profile Functions ---
const profileFunctions = require("./profile");
exports.getUserProfile = profileFunctions.getUserProfile;
exports.updateUserProfile = profileFunctions.updateUserProfile;
exports.bookmarkArticle = profileFunctions.bookmarkArticle;
exports.removeBookmark = profileFunctions.removeBookmark;

// --- Import and Export Search Function ---
const {semanticSearch} = require("./search");
exports.semanticSearch = semanticSearch;

// --- Import and Export Text-to-Speech Function ---
const {generateTTS} = require("./tts");
exports.generateTTS = generateTTS;

// --- Import and Export Content Cleaning + Search Functions ---
const contentFunctions = require("./content");
exports.syncContent = contentFunctions.syncContent;
exports.searchArticles = contentFunctions.searchArticles;

console.log("✅ All Firebase Cloud Functions loaded and exported successfully.");
