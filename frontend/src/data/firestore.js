import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

/**
 * Fetch articles from Firestore
 * Includes automatic fallback if index is missing.
 */
export async function getArticles(category = null, max = 20) {
  try {
    const articlesRef = collection(db, "articles");
    let q;

    if (category) {
      // ✅ Primary query (might require index if combined with multiple filters)
      q = query(
        articlesRef,
        where("category", "==", category.toLowerCase()),
        orderBy("publishedAt", "desc"),
        limit(max)
      );
    } else {
      // ✅ Home page query — may require a simple 2-field index
      q = query(
        articlesRef,
        where("processing_status", "==", "completed"),
        orderBy("publishedAt", "desc"),
        limit(max)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    // ⚠️ Handle index-missing fallback gracefully
    if (err.code === "failed-precondition") {
      console.warn(
        "⚠️ Firestore index missing — falling back to simpler query."
      );

      // 🪄 Fallback: only order by date, ignore filters
      try {
        const fallbackRef = collection(db, "articles");
        const fallbackQuery = query(
          fallbackRef,
          orderBy("publishedAt", "desc"),
          limit(10)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (fallbackErr) {
        console.error("❌ Fallback query also failed:", fallbackErr);
        return [];
      }
    }

    console.error("Error fetching articles:", err);
    return [];
  }
}

/**
 * Fetch a single article by document ID
 */
export async function getArticleById(id) {
  try {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Article not found");
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error("Error fetching article:", err);
    return null;
  }
}