/**
 * content.js
 *
 * Cloud Function (v2): syncContent
 * - Cleans `full_clean_content` HTML/Markdown into `content`
 * - Generates a small `keywords` array for keyword search
 *
 * Usage: deploy with Node 22 + firebase-functions v2
 */

const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// initialize admin if necessary
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Clean raw article HTML/Markdown text.
 *
 * Steps:
 *  - remove <script>/<style> blocks and HTML comments
 *  - remove common cookie / consent / privacy boilerplate by heuristics
 *  - strip HTML tags, decode common entities (&nbsp;, &amp;, etc.)
 *  - remove Markdown images and replace Markdown links with link text
 *  - remove raw URLs and mailto: links
 *  - remove repeated navigation/menu blocks by detecting lines with many links or menu words
 *  - remove excessive newlines/whitespace
 *
 * @param {string} raw Raw article HTML/Markdown string
 * @return {string} cleaned, human-readable article content
 */
function cleanArticleText(raw) {
  if (!raw || typeof raw !== "string") return "";

  let s = raw;

  // 1) remove script/style blocks and HTML comments
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<!--[\s\S]*?-->/g, " ");

  // 2) remove common cookie/consent blocks heuristically (large cookie/consent paragraphs)
  //    If phrases appear, remove that paragraph/section
  const consentPhrases = [
    "manage your consent",
    "manage your consent preferences",
    "privacy policy",
    "accept all",
    "reject all",
    "confirm my choices",
    "cookies",
    "opt-out",
    "targeted advertising",
    "powered by",
    "your california privacy rights",
    "cookie settings",
  ];
  for (const phrase of consentPhrases) {
    const re = new RegExp(`[^\\n]*${phrase}[^\\n]*`, "gi");
    s = s.replace(re, " ");
  }

  // 3) remove long nav/menu blocks (lines containing many links or repeated menu words)
  //    heuristic: any line containing >3 occurrences of "href" or many '|' separators or many menu words
  s = s
    .split("\n")
    .filter((line) => {
      const hrefCount = (line.match(/href=|<a\s+/gi) || []).length;
      const pipeCount = (line.match(/\|/g) || []).length;
      const menuWords = (line.match(/\b(Home|News|Subscribe|Search|Sign in|Contact|About|More|Topics)\b/gi) || []).length;
      // drop if looks like nav/menu
      if (hrefCount > 3 || pipeCount > 4 || menuWords > 3) return false;
      return true;
    })
    .join("\n");

  // 4) Remove Markdown images and inline HTML <img>
  s = s.replace(/!\[.*?\]\(.*?\)/g, " ");
  s = s.replace(/<img[\s\S]*?>/gi, " ");

  // 5) Replace Markdown links [text](url) with text only
  s = s.replace(/\[([^\]]+)\]\((?:https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/gi, "$1");

  // 6) Remove mailto: and plain URLs
  s = s.replace(/mailto:[^\s)]+/gi, " ");
  s = s.replace(/https?:\/\/[^\s)]+/gi, " ");

  // 7) Remove remaining HTML tags
  s = s.replace(/<\/?[^>]+(>|$)/g, " ");

  // 8) Decode common HTML entities
  s = s.replace(/&nbsp;/gi, " ");
  s = s.replace(/&amp;/gi, "&");
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&apos;/gi, "'");
  s = s.replace(/&ndash;|&mdash;/gi, "-");

  // 9) Remove long copyright/legal blocks and boilerplate phrases
  const boilerplate = [
    "©",
    "all rights reserved",
    "read more",
    "read our affiliate link policy",
    "follow us",
    "subscribe",
    "view more",
    "related",
    "most read",
    "advertisement",
    "advertisements",
    "adchoices",
    "cookie policy",
    "privacy choices",
    "user agreement",
  ];
  for (const phrase of boilerplate) {
    const re = new RegExp(`[^\\n]*${phrase}[^\\n]*`, "gi");
    s = s.replace(re, " ");
  }

  // 10) Remove lines that are extremely short or that are pure UI fragments (e.g., "Read next", "Share")
  s = s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (l.length < 20) {
        // allow short lines that contain sentence punctuation
        if (/[.!?]/.test(l)) return true;
        return false;
      }
      // drop lines that are likely "share", "follow", "comments" etc
      if (/^(share|follow|comments|comment|related|read next|prev|next|load more)$/i.test(l)) return false;
      return true;
    })
    .join("\n");

  // 11) Remove excessive repeated separators / dashes / equals used as section markers
  s = s.replace(/={2,}/g, " ");
  s = s.replace(/-{2,}/g, " ");

  // 12) Remove leftover bullets/special characters
  s = s.replace(/[•◦▪→←↑↓★†•●]/g, " ");

  // 13) Collapse multiple spaces and newlines
  s = s.replace(/\r\n|\r/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\s{3,}/g, " ");

  // 14) Trim and ensure reasonable length
  s = s.trim();

  // 15) If resulting content is still extremely long with many repeated short lines (e.g., menu noise),
  //     try a fallback: keep only the first 40 paragraphs/sentences that look like article text.
  const lines = s.split("\n").map((l) => l.trim()).filter(Boolean);
  // keep up to first 2000 words or 80 lines whichever comes earlier
  const joined = lines.join("\n");
  const words = joined.split(/\s+/);
  if (words.length > 4000) {
    s = words.slice(0, 2000).join(" ") + "\n\n[...truncated]";
  }

  return s;
}

/**
 * Generate simple keywords for Firestore search.
 *
 * @param {string} text cleaned article text
 * @return {string[]} array of unique keywords (lowercase), up to 30 items
 */
function generateKeywords(text) {
  if (!text || typeof text !== "string") return [];

  // Lowercase, remove punctuation, split into words
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = cleaned.split(/\s+/).filter(Boolean);

  // Filter stopwords and small words, and take top-occurring words
  const stop = new Set([
    "about", "which", "there", "their", "these", "would", "could", "should",
    "however", "between", "through", "during", "before", "after", "within",
    "while", "where", "when", "what", "your", "you're", "youve", "they",
    "have", "has", "had", "this", "that", "with", "from", "were", "will", "also",
    "theyre", "what's", "it's", "its", "more", "than", "like", "just", "been",
  ]);

  const freq = Object.create(null);
  for (const w of words) {
    if (w.length <= 4) continue; // skip short words
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  const keywords = Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 30);

  return keywords;
}

/**
 * Firestore v2 onDocumentWritten trigger: cleans full_clean_content and updates content + keywords.
 */
exports.syncContent = onDocumentWritten("articles/{docId}", async (event) => {
  try {
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) {
      // document deleted or not present
      return;
    }

    const after = afterSnap.data();
    if (!after || typeof after.full_clean_content !== "string") {
      // nothing to do
      return;
    }

    const raw = after.full_clean_content;
    const cleaned = cleanArticleText(raw);

    // If cleaned is too short, attempt a lighter-clean fallback (strip tags only)
    let finalText = cleaned;
    if (finalText.length < 100) {
      // lighter fallback: strip tags and urls only
      finalText = raw
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<\/?[^>]+(>|$)/g, " ")
        .replace(/https?:\/\/[^\s)]+/g, " ")
        .replace(/!\[.*?\]\(.*?\)/g, " ")
        .replace(/\[([^\]]+)\]\((?:https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/gi, "$1")
        .replace(/\s{2,}/g, " ")
        .trim();
    }

    // Generate keywords from the final cleaned text
    const keywords = generateKeywords(finalText);

    // Update document (use serverTimestamp for updatedAt)
    await afterSnap.ref.update({
      content: finalText,
      keywords,
      processing_status: "completed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`✅ Cleaned article ${event.params.docId} — length ${finalText.length} — keywords ${keywords.length}`);
  } catch (err) {
    logger.error("❌ syncContent error:", err);
  }
});