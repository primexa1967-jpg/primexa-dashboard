import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ---------- BACKEND FUNCTION ENDPOINT ---------- */
const BASE = "https://generatefileasia-ji3e37go5a-el.a.run.app";

export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Dummy logged-in user data (to be passed via context or localStorage)
  const userData = JSON.parse(localStorage.getItem("primexaUser")) || {};

  /* ---------- HANDLE PLAN SELECTION ---------- */
  const handlePlanSubmit = async () => {
    if (!selectedPlan) {
      setMessage("⚠️ Please select a plan before continuing.");
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
      const res = await axios.post(`${BASE}/generateFileAsia`, {
        email: userData.email,
        name: userData.name,
        uid: userData.uid,
        deviceId: userData.deviceId,
        plan: selectedPlan,
        action: "register",
      });

      if (res.status === 200) {
        setMessage("✅ Registration submitted. Awaiting approval.");
        // Redirect to “pending approval” or login page
        setTimeout(() => navigate("/"), 3000);
      } else {
        setMessage("❌ Something went wrong. Try again later.");
      }
    } catch (err) {
      console.error("Plan selection error:", err);
      setMessage("❌ Error submitting registration.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-6">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8">
        Choose Your Plan
      </h1>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-3xl">
        {[
          { id: "plan90", label: "90 Days", days: 90, price: "₹999" },
          { id: "plan180", label: "180 Days", days: 180, price: "₹1799" },
          { id: "plan365", label: "365 Days", days: 365, price: "₹2999" },
        ].map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPlan(p.label)}
            className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${
              selectedPlan === p.label
                ? "border-yellow-400 bg-yellow-600/20"
                : "border-yellow-800 hover:border-yellow-400"
            }`}
          >
            <h2 className="text-2xl font-bold text-yellow-300">{p.label}</h2>
            <p className="text-gray-300 mt-2">{p.price}</p>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handlePlanSubmit}
        disabled={loading}
        className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all"
      >
        {loading ? "Processing…" : "Proceed"}
      </button>

      {/* Status Message */}
      {message && <div className="mt-6 text-yellow-300">{message}</div>}

      {/* Footer */}
      <div className="absolute bottom-6 text-gray-400 text-sm text-center">
        <p>⚠️ After payment, you will receive a registration code by email.</p>
        <p className="text-yellow-400 mt-1">
          Use that code in the registration page to activate your account.
        </p>
      </div>
    </div>
  );
}
