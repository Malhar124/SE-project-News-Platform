/**
 * User Profile Management Functions
 *
 * This file handles creating, reading, and updating user-specific
 * profile data stored in the 'users' collection in Firestore.
 */

const functions = require("firebase-functions");
// Import the initialized Firestore instance
const { firestoreDb } = require("./utils/firebase");
// Import the authentication helper
const { verifyAuth } = require("./utils/auth");
// Import the FieldValue class for array operations
const { FieldValue } = require("firebase-admin/firestore");

/**
 * Gets the current authenticated user's profile data.
 * If no profile exists, it returns an empty object, allowing the
 * frontend to prompt for profile creation.
 */
exports.getUserProfile = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    const uid = verifyAuth(context);

    try {
        const userProfileRef = firestoreDb.collection("users").doc(uid);
        const doc = await userProfileRef.get();

        if (!doc.exists) {
            console.log(`No profile found for user: ${uid}. Returning empty object.`);
            return { profile: {} };
        } else {
            console.log(`Profile retrieved for user: ${uid}`);
            return { profile: doc.data() };
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw new functions.https.HttpsError("internal", "Could not retrieve user profile.");
    }
});

/**
 * Creates or updates a user's profile.
 * Expects an object 'profileData' containing fields to update.
 * Uses { merge: true } to safely update fields without overwriting the whole doc.
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    const uid = verifyAuth(context);

    // 2. Get data to update (e.g., username, bio, preferredCategories)
    const profileData = data.profileData;
    if (!profileData || typeof profileData !== 'object') {
        throw new functions.https.HttpsError("invalid-argument", "Missing or invalid 'profileData'.");
    }
    
    // You could add validation here (e.g., check username length)
    
    try {
        const userProfileRef = firestoreDb.collection("users").doc(uid);
        
        // Use set with { merge: true } to create or update
        await userProfileRef.set(profileData, { merge: true });
        
        console.log(`Profile updated for user: ${uid}`);
        return { success: true, message: "Profile updated successfully." };

    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new functions.https.HttpsError("internal", "Could not update user profile.");
    }
});

/**
 * Adds a single article ID to the user's 'bookmarkedArticles' array.
 * Expects { articleId: "..." }
 */
exports.bookmarkArticle = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    const uid = verifyAuth(context);
    const articleId = data.articleId;

    if (!articleId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing 'articleId'.");
    }

    try {
        const userProfileRef = firestoreDb.collection("users").doc(uid);
        
        // Use FieldValue.arrayUnion to add an item to an array only if it's not already present.
        await userProfileRef.update({
            bookmarkedArticles: FieldValue.arrayUnion(articleId)
        });

        return { success: true, message: "Article bookmarked." };
    } catch (error) {
        console.error("Error bookmarking article:", error);
        throw new functions.https.HttpsError("internal", "Could not bookmark article.");
    }
});

/**
 * Removes a single article ID from the user's 'bookmarkedArticles' array.
 * Expects { articleId: "..." }
 */
exports.removeBookmark = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    const uid = verifyAuth(context);
    const articleId = data.articleId;

    if (!articleId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing 'articleId'.");
    }

    try {
        const userProfileRef = firestoreDb.collection("users").doc(uid);
        
        // Use FieldValue.arrayRemove to remove all instances of an item from an array.
        await userProfileRef.update({
            bookmarkedArticles: FieldValue.arrayRemove(articleId)
        });

        return { success: true, message: "Bookmark removed." };
    } catch (error) {
        console.error("Error removing bookmark:", error);
        throw new functions.https.HttpsError("internal", "Could not remove bookmark.");
    }
});