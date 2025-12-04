import React, { useEffect, useState } from "react";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, provider, app } from "../firebase";
import { useNavigate } from "react-router-dom";

/* -------------------------------------------------
 🔧 Connect to Cloud Function (Backend)
-------------------------------------------------- */
const functions = getFunctions(app, "asia-south1"); // ✅ Must match your deployed region
const verifyUser = httpsCallable(functions, "login");

console.log("🌐 Connected to Firebase Cloud Functions (asia-south1)");

/* -------------------------------------------------
 🔐 Login Page Component
-------------------------------------------------- */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* -------------------------------------------------
   * 1️⃣ Set Firebase Auth Persistence
   * ------------------------------------------------- */
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log("✅ Firebase Auth persistence set"))
      .catch((err) => console.error("⚠️ Persistence setup failed:", err));
  }, []);

  /* -------------------------------------------------
   * 2️⃣ Handle Google Login Button Click
   * ------------------------------------------------- */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🟡 Starting Google Redirect Sign-in...");
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
        console.log("🔁 Checking Google redirect result...");
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const { email, emailVerified } = result.user;
          console.log(`✅ Firebase redirect success for ${email}`);

          if (!emailVerified) {
            setError("Please verify your Google email before logging in.");
            return;
          }

          const deviceId = navigator.userAgent;
          console.log("📱 Device ID:", deviceId);

          // 🔹 Call backend to verify or register user
          const response = await verifyUser({ email, deviceId });
          const data = response.data;

          console.log("🧩 Backend response:", data);

          if (data.ok && data.status === "LOGIN_OK") {
            console.log(`✅ User verified: ${data.role}`);

            if (data.role === "superadmin" || data.role === "admin")
              navigate("/admin");
            else navigate("/dashboard");
          } else if (data.status === "NEW_USER_REGISTERED") {
            console.log("🎉 New user registered — redirecting to plan page");
            navigate("/plan");
          } else {
            console.warn("🚫 Authorization failed:", data.status);
            setError("Authorization failed. Please contact admin.");
          }
        } else {
          console.log("ℹ️ No redirect result found. Waiting for AuthState...");
        }
      } catch (err) {
        console.error("⚠️ Redirect result error:", err);
        setError("Login failed. Please retry.");
      } finally {
        setLoading(false);
      }
    };

    checkRedirect();

    // 4️⃣ Fallback: if already signed in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        console.log(`🔓 Active session detected for ${user.email}`);
        if (user.email === "primexa1967@gmail.com") navigate("/admin");
        else navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* -------------------------------------------------
   * 5️⃣ Page Title
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
