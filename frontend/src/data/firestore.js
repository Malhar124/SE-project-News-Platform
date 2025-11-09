// src/data/firestore.js

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
 * @param {string|null} category - optional category name (e.g. "tech", "sports")
 * @param {number} max - maximum number of articles to return
 */
export async function getArticles(category = null, max = 20) {
  try {
    const articlesRef = collection(db, "articles");

    let q;
    if (category) {
      // 🔥 Filter by category and sort by date (if available)
      q = query(
        articlesRef,
        where("category", "==", category.toLowerCase()),
        where("processing_status", "==", "completed"),
        orderBy("publishedAt", "desc"),
        limit(max)
      );
    } else {
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
    console.error("Error fetching articles:", err);
    return [];
  }
}

/**
 * Fetch a single article by document ID
 * @param {string} id - Firestore document ID
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