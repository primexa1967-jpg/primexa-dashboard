// ✅ Firebase Initialization (PRIMEXA Option Buyer’s Dashboard)
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

/* -------------------------------
 🔹 Firebase Configuration
   (Replace apiKey below with your NEW key
   from Google Cloud → Credentials)
-------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCC4w8c7krKwEDoOXnrpaat13BKhFjYyao", // 🔒 replace only this value
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.appspot.com",
  messagingSenderId: "877238528573",
  appId: "1:877238528573:web:11cbab0974c2103fde1854",
};

/* -------------------------------
 🔹 Initialize Firebase App
-------------------------------- */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/* -------------------------------
 🔹 Initialize Firebase Authentication
-------------------------------- */
const auth = getAuth(app);
auth.useDeviceLanguage();

/* -------------------------------
 🔹 Ensure persistent login
-------------------------------- */
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Firebase Auth persistence set"))
  .catch((err) =>
    console.warn("⚠️ Firebase persistence setup failed:", err.message)
  );

/* -------------------------------
 🔹 Configure Google Sign-In Provider
-------------------------------- */
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ✅ Redirect domain (production only)
console.log("🌐 Firebase Auth running on fnodatadashboardstreamlite.web.app");

/* -------------------------------
 🔹 Exports
-------------------------------- */
export { app, auth, provider };
