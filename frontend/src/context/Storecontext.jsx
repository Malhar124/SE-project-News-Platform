import { createContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "react-toastify";

// ---------------- FIREBASE CONFIGURATION ----------------
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_KEY...", // 🔥 Replace this with your real key from Firebase console
  authDomain: "news-platform-backend-eb75e.firebaseapp.com",
  projectId: "news-platform-backend-eb75e",
  storageBucket: "news-platform-backend-eb75e.appspot.com",
  messagingSenderId: "294081418513",
  appId: "1:294081418513:web:xxxxxxxxxxxxxxxxxxxx",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// ---------------- CONTEXT SETUP ----------------
export const StoreContext = createContext(null);

export default function StoreContextProvider(props) {
  const [showlogin, setshowlogin] = useState(false);
  const [user, setUser] = useState(null); // Firebase user
  const [token, settoken] = useState(localStorage.getItem("token") || "");
  const [articles, setArticles] = useState([]);
  const [showsummary, setshowsummary] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Auto-sync Firebase Auth
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

  // ✅ Fetch Articles from Firestore (using category)
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

  // ✅ Authentication Functions
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

  // ✅ Example: Call a Firebase Cloud Function (optional)
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
    db,
    auth,
    functions,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
}