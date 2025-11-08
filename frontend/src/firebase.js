// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// ✅ Paste your real Firebase config here (from Firebase Console → Project Settings → Web App)
const firebaseConfig = {
  apiKey: "AIzaSyCNcVee1DTqqWPlPwZ-HCNaFPpOr4-nWpc",
  authDomain: "news-platform-backend-eb75e.firebaseapp.com",
  projectId: "news-platform-backend-eb75e",
  storageBucket: "news-platform-backend-eb75e.firebasestorage.app",
  messagingSenderId: "294081418513",
  appId: "1:294081418513:web:a811f295e0eff9e77068b0",
  measurementId: "G-8G3208QKVC"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase utilities
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;