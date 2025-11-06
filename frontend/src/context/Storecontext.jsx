import React, { createContext, useState, useEffect } from "react";
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, FieldValue } from "firebase/firestore"; 
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../firebase"; // Import from your new config file

// Create the context
export const StoreContext = createContext(null);

// --- Create references to your callable functions ---
// (We define these outside the component so they are only created once)
const callSemanticSearch = httpsCallable(functions, "semanticSearch");
const callGenerateTTS = httpsCallable(functions, "generateTTS");
const callGetUserProfile = httpsCallable(functions, "getUserProfile");
const callUpdateUserProfile = httpsCallable(functions, "updateUserProfile");
const callBookmarkArticle = httpsCallable(functions, "bookmarkArticle");
const callRemoveBookmark = httpsCallable(functions, "removeBookmark");


// --- The Context Provider Component ---
const StoreContextProvider = (props) => {
    
    // --- State Management ---
    const [showlogin, setShowLogin] = useState(false);
    const [user, setUser] = useState(null); // Firebase user object
    const [userProfile, setUserProfile] = useState(null); // Your Firestore profile data
    const [loading, setLoading] = useState(true); // Loading state for auth
    const [error, setError] = useState(null); // For login/signup errors

    // --- Auth State Listener ---
    // This is the core of your auth system. It listens for changes.
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is logged in
                setUser(currentUser);
                // Now, fetch their Firestore profile
                await fetchUserProfile(currentUser.uid);
            } else {
                // User is logged out
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // --- Auth Functions (Login, Signup, Logout) ---
    const login = async (email, password) => {
        setError(null); // Clear previous errors
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Auth listener (above) will handle fetching profile
            setShowLogin(false); // Close the popup
        } catch (error) {
            console.error("Error logging in:", error.message);
            setError(error.message); // Set error for the popup to display
        }
    };

    const signup = async (email, password, username) => {
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            
            // --- Create their initial profile document in Firestore ---
            // We call 'updateUserProfile' *immediately* after signup
            // This also creates the doc if it doesn't exist
            await callUpdateUserProfile({ 
                profileData: { 
                    username: username,
                    email: newUser.email,
                    bookmarkedArticles: [] // Start with an empty bookmarks list
                } 
            });
            // Auth listener will pick up the new user
            setShowLogin(false);
        } catch (error) {
            console.error("Error signing up:", error.message);
            setError(error.message);
        }
    };

    const logout = () => {
        signOut(auth);
    };

    // --- Profile & Data Functions ---
    const fetchUserProfile = async (uid) => {
        try {
            const result = await callGetUserProfile();
            setUserProfile(result.data.profile);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Don't set error state here, as it might just mean no profile exists
        }
    };

    const bookmark = async (articleId) => {
        if (!user) return; // Must be logged in
        try {
            await callBookmarkArticle({ articleId: articleId });
            // Optimistically update local state
            setUserProfile(prev => ({
                ...prev,
                bookmarkedArticles: [...(prev.bookmarkedArticles || []), articleId]
            }));
        } catch (error) {
            console.error("Error bookmarking article:", error);
        }
    };
    
    const removeBookmark = async (articleId) => {
        if (!user) return;
        try {
            await callRemoveBookmark({ articleId: articleId });
             // Optimistically update local state
            setUserProfile(prev => ({
                ...prev,
                bookmarkedArticles: (prev.bookmarkedArticles || []).filter(id => id !== articleId)
            }));
        } catch(error) {
            console.error("Error removing bookmark:", error);
        }
    };

    // --- Search & TTS Functions (Pass-through to Firebase) ---
    
    /**
     * Searches articles using the backend keyword search.
     * @param {string} query The user's search text.
     * @param {string} category The category to filter by (e.g., "technology").
     * @returns {Promise<Array>} A promise that resolves to an array of article objects.
     */
    const searchArticles = async (query, category) => {
        if (!user) {
             alert("Please log in to search.");
             return [];
        }
        try {
            const result = await callSemanticSearch({ query: query, category: category });
            return result.data.articles || [];
        } catch (error) {
            console.error("Error searching articles:", error);
            return []; // Return empty on error
        }
    };

    /**
     * Generates speech from text and plays it.
     * @param {string} text The text to speak.
     */
    const speakText = async (text) => {
        if (!user) {
             alert("Please log in to use Text-to-Speech.");
             return;
        }
        try {
            console.log("Requesting TTS from function...");
            const result = await callGenerateTTS({ text: text });
            
            // We got the Base64 audio, now play it
            playBase64Audio(result.data.audio_base64, result.data.mime_type);

        } catch (error) {
            console.error("Error generating speech:", error);
        }
    };

    // --- Helper Function ---
    const playBase64Audio = (base64String, mimeType) => {
        try {
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl); // Clean up
            };
        } catch (error) {
            console.error("Error playing Base64 audio:", error);
        }
    };


    // --- Context Value ---
    // This is what the rest of your app can access
    const contextValue = {
        showlogin,
        setShowLogin,
        user,
        userProfile,
        loading,
        error,
        login,
        signup,
        logout,
        searchArticles,
        speakText,
        bookmark,
        removeBookmark,
        fetchUserProfile // Expose this if needed for manual refresh
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;