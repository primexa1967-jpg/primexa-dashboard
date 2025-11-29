import React, { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import axios from "axios";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzRwBSG8wmfyPgxnBJb25IRbtEADou3S0",
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.firebasestorage.app",
  messagingSenderId: "877238528573",
  appId: "1:877238528573:web:11cbab0974c2103fde1854",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Replace this with your backend URL (FastAPI or Firebase Function)
const BASE = "https://us-central1-fnodatadashboardstreamlite.cloudfunctions.net/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const { email, displayName } = result.user;
      const deviceId = navigator.userAgent;

      const res = await axios.post(`${BASE}/loginUser`, {
        email,
        name: displayName,
        deviceId,
      });

      if (res.data.ok) {
        alert("✅ Login Successful!");
      } else {
        setError("Login rejected: " + res.data.status);
      }
    } catch (err) {
      console.error(err);
      setError("❌ Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "PRIMEXA Option Buyer’s Dashboard Login";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-6">
      <div className="absolute top-8 text-center w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
          OPTION BUYER’S DASHBOARD
        </h1>
        <p className="text-sm md:text-base text-yellow-300 mt-1">
          PRIMEXA Learning Series — WhatsApp 9836001579
        </p>
      </div>

      <div className="bg-black/40 border border-yellow-500 rounded-2xl p-8 mt-24 shadow-lg text-center w-full max-w-sm">
        <h2 className="text-xl font-semibold text-yellow-300 mb-6">Welcome Back</h2>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all"
        >
          {loading ? "Connecting…" : "Sign in with Google"}
        </button>

        <a
          href="https://your-apk-link-or-page.com"
          target="_blank"
          rel="noreferrer"
          className="block w-full mt-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-semibold py-3 rounded-lg hover:scale-105 transition-transform"
        >
          📲 Download PRIMEXA App
        </a>

        {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
      </div>

      <div className="absolute bottom-6 text-gray-400 text-sm text-center">
        Device Limits: <b className="text-yellow-300">User (2)</b> •{" "}
        <b className="text-yellow-300">Admin (1)</b> •{" "}
        <b className="text-yellow-300">Superadmin (3)</b>
        <p className="text-yellow-600 mt-2">
          ⚠️ Strictly for learning and research purposes.
        </p>
      </div>
    </div>
  );
}
