/**
 * content.js
 * Handles cleaning full_clean_content → content,
 * generating keywords, and Firestore keyword-based search.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

// --- Helper: Markdown cleaner ---
function cleanMarkdownToText(md) {
  if (!md) return "";
  let txt = md.replace(/```[\s\S]*?```/g, " ");
  txt = txt.replace(/`[^`]*`/g, " ");
  txt = txt.replace(/!$begin:math:display$.*?$end:math:display$$begin:math:text$.*?$end:math:text$/g, " ");
  txt = txt.replace(/$begin:math:display$([^$end:math:display$]+)\]$begin:math:text$([^)]+)$end:math:text$/g, "$1");
  txt = txt.replace(/^#+\s*/gm, " ");
  txt = txt.replace(/<\/?[^>]+(>|$)/g, " ");
  txt = txt.replace(/\s+/g, " ").trim();
  return txt;
}

// --- Helper: Keyword extractor ---
function extractKeywords(text, topN = 15) {
  if (!text) return [];
  const stop = new Set([
    "the","and","a","an","in","on","of","for","to","is","are","was","were",
    "that","this","with","as","by","be","from","at","or","we","our","will",
    "has","have","had","not","but","they","their","its","which","you","your",
    "it","into","than","then","about"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w));

  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, topN);
}

/**
 * 🔥 Firestore Trigger: Automatically populate `content` and `keywords`
 *    whenever an article is created or updated.
 */
exports.syncContent = functions.firestore
  .document("articles/{docId}")
  .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() : null;
    if (!after) return null;

    const ref = change.after.ref;
    const full = after.full_clean_content || "";
    const content = after.content || "";

    // Only regenerate if content is missing/short or full_clean_content changed
    const shouldUpdate =
      !content || content.length < 100 ||
      (change.before.exists &&
        change.before.data().full_clean_content !== full);

    if (!shouldUpdate && after.keywords) return null;

    const updates = {};
    if (full && shouldUpdate) {
      const cleaned = cleanMarkdownToText(full);
      updates.content = cleaned.slice(0, 50000);
    }

    const textForKeywords = updates.content || content || full;
    const keywords = extractKeywords(textForKeywords, 20);
    if (keywords.length) updates.keywords = keywords;

    if (after.processing_status !== "failed")
      updates.processing_status = "completed";

    if (Object.keys(updates).length > 0) {
      await ref.update(updates);
      console.log(`✅ Updated article ${context.params.docId}`);
    }
    return null;
  });

/**
 * 🔎 Callable Search: Query articles by keyword or fallback text search
 */
exports.searchArticles = functions.https.onCall(async (data, context) => {
  const rawQuery = (data && data.query) ? String(data.query).trim() : "";
  const limit = Math.min(Number(data.limit) || 20, 100);
  if (!rawQuery) return { success: false, message: "Empty query" };

  const tokens = rawQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);

  try {
    const ref = db.collection("articles");
    const snap = await ref
      .where("processing_status", "==", "completed")
      .where("keywords", "array-contains-any", tokens.slice(0, 10))
      .orderBy("publishedAt", "desc")
      .limit(limit)
      .get();

    if (!snap.empty) {
      return {
        success: true,
        results: snap.docs.map(d => ({ id: d.id, ...d.data() })),
      };
    }

    // Fallback: manual substring filter
    const fallbackSnap = await ref
      .where("processing_status", "==", "completed")
      .orderBy("publishedAt", "desc")
      .limit(200)
      .get();

    const qLower = rawQuery.toLowerCase();
    const results = fallbackSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(a =>
        ((a.title || "") + " " + (a.content || "")).toLowerCase().includes(qLower)
      )
      .slice(0, limit);

    return { success: true, results };
  } catch (err) {
    console.error("❌ searchArticles error:", err);
    return { success: false, message: err.message };
  }
});