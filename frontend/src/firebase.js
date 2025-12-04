// ✅ Import Firebase SDK modules
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

/* -------------------------------------------------
 🔧 Firebase Project Configuration
 (Replace apiKey with your actual key from Firebase Console → Project Settings → SDK setup)
-------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCC4w8c7krKwEDoOXnrpaat13BKhFjYyao", // 🔑 add from Firebase Console
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  databaseURL:
    "https://fnodatadashboardstreamlite-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.appspot.com", // ✅ corrected
  messagingSenderId: "877238528573",
  appId: "1:877238528573:web:d8da5eef41372013de1854",
};

/* -------------------------------------------------
 🚀 Initialize Firebase App (Safe for Hot Reload)
-------------------------------------------------- */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/* -------------------------------------------------
 🔐 Firebase Auth Setup
-------------------------------------------------- */
const auth = getAuth(app);

// ✅ Keep users signed in between sessions
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("🔐 Firebase Auth persistence set"))
  .catch((err) => console.warn("⚠️ Persistence setup failed:", err.message));

auth.useDeviceLanguage();

/* -------------------------------------------------
 🌐 Google Auth Provider Setup
-------------------------------------------------- */
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
  client_id:
    "877238528573-p5jucu5u9613gu583n6c6d19s2plp0d6.apps.googleusercontent.com",
});

/* -------------------------------------------------
 📦 Exports
-------------------------------------------------- */
export { app, auth, provider };
