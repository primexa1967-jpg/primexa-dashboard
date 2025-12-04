// frontend/src/pages/PlanPage.jsx
import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, app } from "../firebase";
import { useNavigate } from "react-router-dom";

const functions = getFunctions(app, "asia-south1");
const sendEmailCode = httpsCallable(functions, "sendEmailCode");

export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setStatus("Please login with Google first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Processing payment and sending verification link...");

      const res = await sendEmailCode({
        email: auth.currentUser.email,
        plan: selectedPlan,
      });

      if (res.data.ok) {
        setStatus("✅ Email sent! Please check your inbox to verify registration.");
      } else {
        setStatus("⚠️ Failed to send email. Try again later.");
      }
    } catch (err) {
      console.error("PlanPage Error:", err);
      setStatus("❌ Error occurred. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
        Choose Your Plan
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button
          onClick={() => setSelectedPlan("monthly")}
          className={`px-6 py-3 rounded-lg border ${
            selectedPlan === "monthly"
              ? "bg-yellow-500 text-black font-semibold"
              : "border-yellow-500 text-yellow-400"
          }`}
        >
          Monthly — ₹499
        </button>
        <button
          onClick={() => setSelectedPlan("yearly")}
          className={`px-6 py-3 rounded-lg border ${
            selectedPlan === "yearly"
              ? "bg-yellow-500 text-black font-semibold"
              : "border-yellow-500 text-yellow-400"
          }`}
        >
          Yearly — ₹4999
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-lg"
      >
        {loading ? "Processing..." : "Proceed to Pay & Verify"}
      </button>

      {status && (
        <div className="mt-4 text-center text-yellow-300 font-medium max-w-sm">
          {status}
        </div>
      )}
    </div>
  );
}
