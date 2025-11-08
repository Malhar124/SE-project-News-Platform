// src/context/Storecontext.jsx

import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { toast } from "react-toastify";

// ✅ Import your already initialized Firebase app
import { auth, db, functions } from "../firebase";

export const StoreContext = createContext(null);

export default function StoreContextProvider({ children }) {
  const [showlogin, setshowlogin] = useState(false);
  const [user, setUser] = useState(null);
  const [token, settoken] = useState(localStorage.getItem("token") || "");
  const [articles, setArticles] = useState([]);
  const [showsummary, setshowsummary] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        settoken(token);
        setUser(firebaseUser);
        localStorage.setItem("token", token);
        localStorage.setItem("userId", firebaseUser.uid);
      } else {
        settoken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Firestore fetch
  const fetchArticles = async (category = null) => {
    try {
      const articlesRef = collection(db, "articles");
      const q = category
        ? query(articlesRef, where("category", "==", category))
        : articlesRef;

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles from Firestore.");
    }
  };

  // ✅ Auth actions
  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      settoken(token);
      setUser(userCredential.user);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userCredential.user.uid);
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    }
  };

  const registerUser = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        preferences: [],
        createdAt: new Date(),
      });
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      settoken("");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      toast.info("Logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    }
  };

  // ✅ Cloud Function example
  const runSemanticSearch = async (keyword) => {
    try {
      const semanticSearch = httpsCallable(functions, "semanticSearch");
      const result = await semanticSearch({ keyword });
      return result.data;
    } catch (error) {
      console.error("Semantic search error:", error);
      toast.error("Search function failed.");
      return [];
    }
  };

  const contextValue = {
    showlogin,
    setshowlogin,
    user,
    token,
    settoken,
    showsummary,
    setshowsummary,
    loading,
    articles,
    fetchArticles,
    loginUser,
    registerUser,
    logoutUser,
    runSemanticSearch,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}