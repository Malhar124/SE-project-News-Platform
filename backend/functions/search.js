/**
 * Firebase Callable Cloud Function for performing keyword search.
 * This function queries Firestore using the `keywords` field.
 * It supports optional category filtering and sorts results by `publishedAt`.
 */

const { onCall } = require("firebase-functions/v2/https");
const { logger, HttpsError } = require("firebase-functions");
const { firestoreDb } = require("./src/utils/firebase");
const { verifyAuth } = require("./src/utils/auth");

/**
 * Cleans and splits a search query string into an array of keywords.
 * @param {string} queryText - The raw user search query.
 * @return {string[]} Array of cleaned, lowercase keywords.
 */
function generateKeywordsFromQuery(queryText) {
  if (!queryText || typeof queryText !== "string") return [];

  // Basic stop words to ignore
  const stopWords = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for",
    "from", "has", "he", "in", "is", "it", "its", "of", "on",
    "that", "the", "to", "was", "were", "will", "with",
  ]);

  // Lowercase, remove punctuation, split into words
  const words = queryText
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word) && word.length > 2);

  // Return unique keywords
  return [...new Set(words)];
}

/**
 * Callable Cloud Function: semanticSearch
 * Performs Firestore keyword-based search using array-contains-any.
 */
exports.semanticSearch = onCall(async (data, context) => {
  // 1️⃣ Verify authentication
  const uid = verifyAuth(context);
  logger.info(`🔍 Keyword search initiated by UID: ${uid}`);

  // 2️⃣ Validate input
  const queryText = data.query;
  if (!queryText || typeof queryText !== "string" || queryText.trim().length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a non-empty string \"query\" argument."
    );
  }

  // 3️⃣ Extract keywords from the query
  const searchKeywords = generateKeywordsFromQuery(queryText);
  if (searchKeywords.length === 0) {
    logger.info("No valid keywords after processing query.");
    return { articles: [] };
  }

  // 4️⃣ Optional category filter
  const categoryFilter = data.category ? data.category : null;
  logger.info(
    `Keyword Search: keywords=[${searchKeywords.join(", ")}], category=${
      categoryFilter || "None"
    }`
  );

  try {
    let query = firestoreDb.collection("articles");

    // Apply category filter if provided
    if (categoryFilter) {
      query = query.where("category", "==", categoryFilter);
    }

    // Firestore allows max 30 terms in array-contains-any
    const keywordsForQuery = searchKeywords.slice(0, 10);
    query = query.where("keywords", "array-contains-any", keywordsForQuery);

    // Order by newest first and limit results
    query = query.orderBy("publishedAt", "desc").limit(25);

    // 5️⃣ Execute the query
    const snapshot = await query.get();

    if (snapshot.empty) {
      logger.info("No matching articles found in Firestore.");
      return { articles: [] };
    }

    // 6️⃣ Prepare response
    const articles = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const { full_clean_content, keywords, ...article } = data;
      articles.push({ id: doc.id, ...article });
    });

    logger.info(`✅ Returning ${articles.length} matching articles.`);
    return { articles };
  } catch (error) {
    logger.error("❌ Error during keyword search:", error);

    if (error.code === "failed-precondition") {
      throw new HttpsError(
        "failed-precondition",
        "Search failed. This query may require a Firestore composite index. " +
          "Check the Firebase console logs for a link to create it."
      );
    }

    throw new HttpsError("internal", "Search failed to execute.");
  }
});