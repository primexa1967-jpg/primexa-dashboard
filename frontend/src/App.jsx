// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// 🔹 Page Imports
import LoginPage from "./pages/LoginPage";
import PlanPage from "./pages/PlanPage";
import VerifyPage from "./pages/VerifyPage";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟡 Watch Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400">
        Loading…
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🏁 Default Route */}
        <Route path="/" element={<LoginPage />} />

        {/* 💳 Plan Page — only if logged in */}
        <Route
          path="/plan"
          element={user ? <PlanPage /> : <Navigate to="/" replace />}
        />

        {/* ✅ Verification Page (email/OTP link) */}
        <Route path="/verify" element={<VerifyPage />} />

        {/* 📊 Dashboard — only for logged in users */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" replace />}
        />

        {/* 🛠️ Admin Page — only for admin/superadmin */}
        <Route
          path="/admin"
          element={
            user &&
            (user.email === "primexa1967@gmail.com" ||
              localStorage.getItem("primexaRole") === "admin" ||
              localStorage.getItem("primexaRole") === "superadmin") ? (
              <AdminPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 🌐 Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-black flex items-center justify-center text-yellow-400 text-xl">
              404 | Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
