import React, { useEffect, useState } from "react";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🌐 Backend Cloud Function endpoint
const BASE = "https://generatefileasia-ji3e37go5a-el.a.run.app";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* -------------------------------------------------
   * 1️⃣ Set Firebase Auth Persistence (Session memory)
   * ------------------------------------------------- */
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() =>
        console.log("🔐 Firebase Auth persistence set successfully.")
      )
      .catch((err) => console.error("⚠️ Persistence error:", err));
  }, []);

  /* -------------------------------------------------
   * 2️⃣ Handle Google Login Button Click
   * ------------------------------------------------- */
  const handleGoogleLogin = async () => {
    try {
      console.log("🖱️ Sign-in button clicked");
      setLoading(true);
      setError("");

      // Start Firebase redirect login
      await signInWithRedirect(auth, provider);
      console.log("➡️ Redirect initiated...");
    } catch (err) {
      console.error("❌ Redirect login error:", err);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  /* -------------------------------------------------
   * 3️⃣ Handle Redirect Result (after Google login)
   * ------------------------------------------------- */
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        console.log("🔁 Checking redirect result...");
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const { email, displayName, uid } = result.user;
          const deviceId = navigator.userAgent;

          console.log(`✅ Firebase login success: ${email}`);

          // 🔹 Notify backend (user tracking / registration)
          try {
            await axios.post(`${BASE}/generateFileAsia`, {
              email,
              name: displayName || "Anonymous User",
              uid,
              deviceId,
            });
            console.log("📡 Backend tracking successful.");
          } catch (apiError) {
            console.warn("⚠️ Backend tracking failed:", apiError.message);
          }

          // 🔹 Role-based routing
          if (email === "primexa1967@gmail.com") {
            console.log("🔑 Redirecting to Admin Panel...");
            navigate("/admin");
          } else {
            console.log("📊 Redirecting to Dashboard...");
            navigate("/dashboard");
          }
        } else {
          console.log("ℹ️ No redirect result — waiting for AuthStateChanged...");
        }
      } catch (err) {
        console.error("⚠️ Redirect result error:", err);
        setError("Login failed. Try again.");
      } finally {
        setLoading(false);
      }
    };

    checkRedirect();

    /* -------------------------------------------------
     * 4️⃣ Fallback for already logged-in users
     * ------------------------------------------------- */
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`✅ Logged-in user detected: ${user.email}`);
        if (user.email === "primexa1967@gmail.com") navigate("/admin");
        else navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* -------------------------------------------------
   * 5️⃣ Page Title Setup
   * ------------------------------------------------- */
  useEffect(() => {
    document.title = "PRIMEXA Option Buyer’s Dashboard Login";
  }, []);

  /* -------------------------------------------------
   * 6️⃣ UI Layout
   * ------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="absolute top-8 text-center w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
          OPTION BUYER’S DASHBOARD
        </h1>
        <p className="text-sm md:text-base text-yellow-300 mt-1">
          PRIMEXA Learning Series — WhatsApp 9836001579
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-black/50 border border-yellow-500 rounded-2xl p-8 mt-24 shadow-lg text-center w-full max-w-sm">
        <h2 className="text-xl font-semibold text-yellow-300 mb-6">
          Welcome Back
        </h2>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            loading
              ? "bg-yellow-700 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-400 text-black"
          }`}
        >
          {loading ? "Connecting…" : "Sign in with Google"}
        </button>

        <a
          href="https://fnodatadashboardstreamlite.web.app"
          target="_blank"
          rel="noreferrer"
          className="block w-full mt-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-semibold py-3 rounded-lg hover:scale-105 transition-transform"
        >
          📲 Download PRIMEXA App
        </a>

        {error && (
          <div className="text-red-500 mt-4 text-sm font-medium">{error}</div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-gray-400 text-sm text-center">
        Device Limits:{" "}
        <b className="text-yellow-300">User (2)</b> •{" "}
        <b className="text-yellow-300">Admin (1)</b> •{" "}
        <b className="text-yellow-300">Superadmin (3)</b>
        <p className="text-yellow-600 mt-2">
          ⚠️ Strictly for learning and research purposes.
        </p>
      </div>
    </div>
  );
}
