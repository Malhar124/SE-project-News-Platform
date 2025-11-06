import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// ----------------------------------------------------------------
// 1. GET YOUR FIREBASE CONFIG FROM THE FIREBASE CONSOLE
// ----------------------------------------------------------------
// Go to your Firebase Project > Project Settings (gear icon)
// > General tab > Scroll down to "Your apps" > Click the Web icon (</>)
// Copy the 'firebaseConfig' object and paste it here.
// 
const firebaseConfig = {
  apiKey: "AIzaSyCNcVee1DTqqWPlPwZ-HCNaFPpOr4-nWpc",
  authDomain: "news-platform-backend-eb75e.firebaseapp.com",
  projectId: "news-platform-backend-eb75e",
  storageBucket: "news-platform-backend-eb75e.firebasestorage.app",
  messagingSenderId: "294081418513",
  appId: "1:294081418513:web:a811f295e0eff9e77068b0",
  measurementId: "G-8G3208QKVC"
};

// ----------------------------------------------------------------
// 2. INITIALIZE FIREBASE AND SERVICES
// ----------------------------------------------------------------
const app = initializeApp(firebaseConfig);

// Get references to the core services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "us-central1"); // Use the same region as your functions

// ----------------------------------------------------------------
// 3. CONNECT TO LOCAL EMULATORS (FOR TESTING)
// ----------------------------------------------------------------
// This checks if the app is running on localhost (your 'npm run dev' server)
// If it is, it connects to all the emulators you started in your terminal.
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  console.log(
    "React App is on localhost. Connecting to Firebase Emulators..."
  );

  // Point Functions to the local emulator (default: 5001)
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  // Point Auth to the local emulator (default: 9099)
  connectAuthEmulator(auth, "http://127.0.0.1:9099");

  // Point Firestore to the local emulator (port 8081, as you configured!)
  connectFirestoreEmulator(db, "127.0.0.1", 8081);
} else {
  console.log("React App is in production. Connecting to live Firebase services.");
}

// ----------------------------------------------------------------
// 4. EXPORT THE SERVICES
// ----------------------------------------------------------------
// Export the initialized services for your components and context to use
export { app, auth, db, functions };
