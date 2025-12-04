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
-------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCC4w8c7krKwEDoOXnrpaat13BKhFjYyao",
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  databaseURL: "https://fnodatadashboardstreamlite-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.firebasestorage.app",
  messagingSenderId: "877238528573",
  appId: "1:877238528573:web:d8da5eef41372013de1854"
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

console.log("🌐 Firebase Auth running on fnodatadashboardstreamlite.web.app");

/* -------------------------------
 🔹 Export everything for use elsewhere
-------------------------------- */
export { app, auth, provider };
