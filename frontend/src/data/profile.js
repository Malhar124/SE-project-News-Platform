// src/data/profile.js
import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";

export async function getUserProfile() {
  const fn = httpsCallable(functions, "getUserProfile");
  const res = await fn();
  return res.data.profile;
}

export async function updateUserProfile(profileData) {
  const fn = httpsCallable(functions, "updateUserProfile");
  const res = await fn({ profileData });
  return res.data.message;
}

export async function bookmarkArticle(articleId) {
  const fn = httpsCallable(functions, "bookmarkArticle");
  await fn({ articleId });
}

export async function removeBookmark(articleId) {
  const fn = httpsCallable(functions, "removeBookmark");
  await fn({ articleId });
}