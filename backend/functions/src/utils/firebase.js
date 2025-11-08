// Import the Firebase Admin SDK
const admin = require("firebase-admin");

let db; // Variable to hold the Firestore database instance

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * Safe to call multiple times.
 * @return {FirebaseFirestore.Firestore} The initialized Firestore database instance.
 */
function initializeFirebaseAdmin() {
  // Check if the SDK has already been initialized in this environment
  if (!admin.apps.length) {
    try {
      // Initialize the SDK using the application default credentials
      // (these are automatically available in the Cloud Functions environment)
      admin.initializeApp();
      console.log("Firebase Admin SDK initialized successfully.");
      db = admin.firestore(); // Get the Firestore database instance
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      // In a real application, you might want to handle this more gracefully
      // or throw the error to prevent the function from running incorrectly.
      // For now, db will remain undefined.
    }
  } else if (!db) {
    // If initialized but db hasn't been assigned (e.g., in rare cold start scenarios)
    db = admin.firestore();
  }
  return db; // Return the Firestore instance
}

// Initialize the SDK when this module is first required
const firestoreDb = initializeFirebaseAdmin();

// Export the initialized Firestore instance so other functions can use it
module.exports = { firestoreDb };
