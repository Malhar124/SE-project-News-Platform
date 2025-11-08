/**
 * Utility functions for handling Firebase Authentication within Cloud Functions.
 */
const functions = require("firebase-functions");

/**
 * Verifies that the function was called by an authenticated user.
 * This is for use with "Callable" functions (functions.https.onCall).
 *
 * @param {functions.https.CallableContext} context - The context object passed to the callable function.
 * @return {string} The authenticated user's UID.
 * @throws {functions.https.HttpsError} Throws 'unauthenticated' error if context.auth is missing.
 */
function verifyAuth(context) {
  // Check if the function was called by an authenticated user.
  if (!context.auth) {
    console.error("Authentication Error: Function called without authentication context.");
    // Throwing an HttpsError is the standard way to handle errors in callable functions.
    // The client will receive this error.
    throw new functions.https.HttpsError(
        "unauthenticated", // Error code
        "The function must be called while authenticated.", // Error message
    );
  }

  // Authentication successful, log and return the user ID.
  const uid = context.auth.uid;
  console.log(`Request authenticated for user UID: ${uid}`);
  return uid;
}

module.exports = {
  verifyAuth,
};
