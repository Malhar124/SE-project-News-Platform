// src/data/search.js
import { functions } from "../firebase";
import {getFunctions, httpsCallable } from "firebase/functions";
import {auth} from "../firebase"
import app from "../firebase";
export async function searchArticles(query) {

  if (!auth.currentUser) {
    throw new Error("User not signed in. Cannot perform search.");
  }
  const fn = httpsCallable(functions, "semanticSearch");
  const res = await fn({ query });
  
  console.log("Firebase response:", res); 
  return res.data.articles;
}