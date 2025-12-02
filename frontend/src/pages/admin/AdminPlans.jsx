import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import axios from "axios";

/* ----------  FIREBASE CONFIG  ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBzRwBSG8wmfyPgxnBJb25IRbtEADou3S0",
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.appspot.com",
  messagingSenderId: "877238528573",
  appId: "1:877238528573:web:11cbab0974c2103fde1854",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Cloud Function URL (replace with your deployed URL)
const MANAGE_PLANS_URL = "https://manageplans-ji3e37go5a-el.a.run.app";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: "", durationDays: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ----------  FETCH PLANS FROM FIRESTORE  ---------- */
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "plans"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlans(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  /* ----------  ADD NEW PLAN  ---------- */
  const addPlan = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in first.");
      return;
    }

    if (!newPlan.name || !newPlan.durationDays || !newPlan.price) {
      setError("All fields required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(MANAGE_PLANS_URL, {
        action: "add",
        email: user.email,
        name: newPlan.name,
        durationDays: newPlan.durationDays,
        price: newPlan.price,
      });

      if (res.data.ok) {
        setNewPlan({ name: "", durationDays: "", price: "" });
        fetchPlans();
      } else {
        setError(res.data.error || "Add failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ----------  DELETE PLAN (Superadmin Only)  ---------- */
  const deletePlan = async (planId) => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");
    if (!window.confirm("Delete this plan permanently?")) return;

    setLoading(true);
    try {
      const res = await axios.post(MANAGE_PLANS_URL, {
        action: "delete",
        email: user.email,
        planId,
      });

      if (res.data.ok) {
        fetchPlans();
      } else {
        setError(res.data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "PRIMEXA • Manage Plans";
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-yellow-300 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-yellow-400">
        Manage Subscription Plans
      </h1>

      <form
        onSubmit={addPlan}
        className="bg-black/50 border border-yellow-500 p-6 rounded-lg max-w-md mx-auto mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Add New Plan</h2>
        <input
          type="text"
          placeholder="Plan Name (e.g., Monthly)"
          value={newPlan.name}
          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
          className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="number"
          placeholder="Duration (days)"
          value={newPlan.durationDays}
          onChange={(e) =>
            setNewPlan({ ...newPlan, durationDays: e.target.value })
          }
          className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={newPlan.price}
          onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
          className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-semibold py-2 rounded hover:bg-yellow-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Plan"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border border-yellow-700 text-sm">
          <thead className="bg-yellow-700 text-black">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Duration (days)</th>
              <th className="p-2">Price (₹)</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="text-center border-t border-yellow-800"
              >
                <td className="p-2">{plan.name}</td>
                <td className="p-2">{plan.durationDays}</td>
                <td className="p-2">{plan.price}</td>
                <td className="p-2">
                  {plan.active ? (
                    <span className="bg-green-500 text-black px-2 py-1 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-500 px-2 py-1 rounded">Inactive</span>
                  )}
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="bg-red-600 px-2 py-1 rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="text-center text-red-500 mt-4 text-sm">{error}</div>
      )}
    </div>
  );
}
