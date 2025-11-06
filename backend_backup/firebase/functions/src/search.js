/**
 * Firebase Callable Cloud Function for performing KEYWORD search.
 * This function does NOT use vector embeddings or external Python services.
 * It queries Firestore directly using an 'array-contains-any' query
 * on a pre-generated 'keywords' field.
 */

const functions = require("firebase-functions");
// Import the initialized Firestore instance
const { firestoreDb } = require("./utils/firebase");
// Import the authentication helper
const { verifyAuth } = require("./utils/auth");

/**
 * Cleans a search query string and splits it into an array of keywords.
 * @param {string} queryText The raw user search query.
 * @returns {string[]} An array of cleaned, lowercase keywords.
 */
function generateKeywordsFromQuery(queryText) {
    if (!queryText || typeof queryText !== 'string') return [];
    
    // A simple list of stop words to ignore, similar to the Python script
    const stopWords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
        'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'
    ]);

    // Simple text cleaning: lowercase, remove punctuation, split by space
    const words = queryText
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/) // Split by one or more spaces
        .filter(word => word && !stopWords.has(word) && word.length > 2); // Filter empty/stop words
    
    // Return a unique set of keywords
    return [...new Set(words)];
}

exports.semanticSearch = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    const uid = verifyAuth(context);
    console.log(`Keyword search initiated by authenticated user: ${uid}`);

    // 2. Get and Process Query
    const queryText = data.query;
    if (!queryText || typeof queryText !== 'string' || queryText.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a non-empty string "query" argument.');
    }
    
    // Generate keywords from the user's query
    const searchKeywords = generateKeywordsFromQuery(queryText);
    
    if (searchKeywords.length === 0) {
        console.log("No valid keywords after processing query.");
        return { articles: [] }; // Return empty results
    }

    const categoryFilter = data.category || null;
    console.log(`Keyword Search: Keywords=${searchKeywords.join(', ')}, Category='${categoryFilter || 'None'}'`);

    try {
        // 3. Build the Firestore Query
        let query = firestoreDb.collection('articles');

        // A. Apply category filter if it exists
        if (categoryFilter) {
            query = query.where('category', '==', categoryFilter);
        }

        // B. Apply keyword filter
        // Find documents where the 'keywords' array contains ANY of the search keywords
        // Note: Firestore 'array-contains-any' is limited to 30 keywords. We'll take the first 10.
        const keywordsForQuery = searchKeywords.slice(0, 10);
        query = query.where('keywords', 'array-contains-any', keywordsForQuery);
        
        // C. Limit and order the results
        query = query.orderBy('publishedAt', 'desc').limit(25); // Order by most recent

        // 4. Execute the query
        const snapshot = await query.get();

        if (snapshot.empty) {
            console.log('No matching documents found in Firestore.');
            return { articles: [] };
        }

        // 5. Format and return results
        const articles = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Exclude large fields to save bandwidth
            const { full_clean_content, keywords, ...article } = data;
            articles.push({ id: doc.id, ...article });
        });
        
        console.log(`Returning ${articles.length} articles.`);
        return { articles: articles };

    } catch (error) {
        console.error("Error during keyword search:", error);
        // This can happen if you are missing a composite index
        if (error.code === 'failed-precondition') {
             throw new functions.https.HttpsError('failed-precondition', 
                'Search failed. This query requires a composite index in Firestore. ' +
                'Please check the Firebase console logs for a link to create it.'
             );
        }
        throw new functions.https.HttpsError('internal', 'Search failed to execute.');
    }
});