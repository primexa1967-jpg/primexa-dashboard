import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ---------- BACKEND FUNCTION ENDPOINT ---------- */
const BASE = "https://generatefileasia-ji3e37go5a-el.a.run.app";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Logged-in user from localStorage (set by login)
  const userData = JSON.parse(localStorage.getItem("primexaUser")) || {};

  /* ---------- HANDLE INPUT CHANGE ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- HANDLE REGISTRATION SUBMIT ---------- */
  const handleRegister = async () => {
    const { name, mobile, code } = formData;

    if (!name || !mobile || !code) {
      setMessage("⚠️ All fields are required.");
      return;
    }

    if (!userData.email) {
      setMessage("⚠️ Missing user data. Please login again.");
      navigate("/");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 🔥 Call backend to verify registration code
      const res = await axios.post(`${BASE}/generateFileAsia`, {
        email: userData.email,
        name,
        mobile,
        code,
        deviceId: userData.deviceId,
        uid: userData.uid,
        action: "verifyCode",
      });

      if (res.status === 200 && res.data.ok) {
        setMessage("✅ Registration successful! Redirecting…");
        localStorage.removeItem("primexaUser");
        setTimeout(() => navigate("/dashboard"), 2500);
      } else {
        setMessage("❌ Invalid or expired code. Please check again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("❌ Error verifying code. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-6">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8">
        Registration Verification
      </h1>

      {/* Form */}
      <div className="bg-black/40 border border-yellow-500 rounded-2xl p-8 shadow-lg w-full max-w-md">
        <p className="text-sm text-gray-400 mb-6">
          Enter your details and registration code received via email.
        </p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-yellow-700 text-white focus:outline-none focus:border-yellow-400"
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-yellow-700 text-white focus:outline-none focus:border-yellow-400"
        />

        <input
          type="text"
          name="code"
          placeholder="Registration Code"
          value={formData.code}
          onChange={handleChange}
          className="w-full p-3 mb-6 rounded-lg bg-gray-800 border border-yellow-700 text-white focus:outline-none focus:border-yellow-400 tracking-widest uppercase"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all"
        >
          {loading ? "Verifying…" : "Verify & Register"}
        </button>

        {message && (
          <div className="mt-4 text-center text-yellow-300">{message}</div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-gray-400 text-sm text-center">
        <p>⚠️ This registration link is one-time use only.</p>
        <p className="text-yellow-500 mt-1">
          Used or expired codes cannot be reused.
        </p>
      </div>
    </div>
  );
}
