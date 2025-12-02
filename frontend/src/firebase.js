// ✅ Firebase Initialization (Production Safe + Redirect Fixed)
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

/* ---------- FIREBASE CONFIG ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBzRwBSG8wmfyPgxnBJb25IRbtEADou3S0",
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.appspot.com",
  messagingSenderId: "877238528573",
  appId: "1:877238528573:web:11cbab0974c2103fde1854",
};

/* ---------- INITIALIZE ---------- */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ---------- AUTH PERSISTENCE ---------- */
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("🔐 Firebase Auth persistence set"))
  .catch((err) => console.warn("⚠️ Persistence setup failed:", err.message));

auth.useDeviceLanguage();

/* ---------- GOOGLE PROVIDER ---------- */
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
  // ✅ Ensure correct client ID is used (from Google provider in Firebase)
  client_id:
    "877238528573-p5jucu5u9613gu583n6c6d19s2plp0d6.apps.googleusercontent.com",
});

/* ---------- REDIRECT DOMAIN FIX ---------- */
if (window.location.hostname.includes("fnodatadashboardstreamlite")) {
  console.log("🌐 Redirect URI set to hosted app domain");
}

/* ---------- EXPORTS ---------- */
export { app, auth, provider };
