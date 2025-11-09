// src/data/search.js
import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";

export async function searchArticles(query) {
  const fn = httpsCallable(functions, "semanticSearch");
  const res = await fn({ query });
  return res.data.articles;
}t