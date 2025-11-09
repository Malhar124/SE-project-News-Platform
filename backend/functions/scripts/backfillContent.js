/**
 * @fileoverview Backfill script to trigger re-cleaning for all Firestore articles.
 * Run this manually using: `node scripts/backfillContent.js`
 */

const admin = require("firebase-admin");

// ✅ Path to your service account key
const serviceAccount = require("/Users/malharudmale/Desktop/news platform/backend/news-platform-backend-eb75e-firebase-adminsdk-fbsvc-5b37da6380.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "news-platform-backend-eb75e",
});

const db = admin.firestore();

/**
 * Iterates over all Firestore articles and re-triggers cleaning,
 * even if previously processed. Useful for global re-cleaning after
 * improving your text cleaner logic.
 *
 * @async
 * @return {Promise<void>} Resolves when all eligible docs are updated.
 */
async function backfill() {
  console.log("🚀 Starting FULL Firestore re-clean for articles...");

  const snapshot = await db.collection("articles").get();

  if (snapshot.empty) {
    console.log("⚠️ No articles found in Firestore.");
    return;
  }

  console.log(`📰 Found ${snapshot.size} articles to re-clean...`);

  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (!data.full_clean_content) {
      console.log(`⚠️ Skipping ${doc.id} (no full_clean_content)`);
      continue;
    }

    await doc.ref.update({
      _triggerSync: new Date().toISOString(), // triggers syncContent Cloud Function
      processing_status: "pending_reclean", // mark for tracking
    });

    count++;
    if (count % 25 === 0) {
      console.log(`✅ Triggered ${count}/${snapshot.size} so far...`);
    }
  }

  console.log(`🎉 Done! Triggered ${count} articles for re-cleaning.`);
}

backfill().catch((err) => {
  console.error("❌ Error running backfill:", err);
  process.exit(1);
});