// frontend/src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { signOut } from "firebase/auth";
import { auth, app } from "../firebase";
import { useNavigate } from "react-router-dom";

/* 🔧 Initialize Firebase Callable Functions */
const functions = getFunctions(app, "asia-south1");
const fetchUsersFn = httpsCallable(functions, "fetchUsers");
const adminUsersFn = httpsCallable(functions, "adminUsers");

export default function AdminPage() {
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("plan90");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  /* 🟡 Fetch Users (Pending + Active) */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [pendingRes, activeRes] = await Promise.all([
        fetchUsersFn({ type: "pending" }),
        fetchUsersFn({ type: "active" }),
      ]);
      setPendingUsers(pendingRes.data.users || []);
      setActiveUsers(activeRes.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage("⚠️ Unable to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  /* 🟢 Approve User */
  const approveUser = async (user) => {
    try {
      setLoading(true);
      const res = await adminUsersFn({
        action: "approve",
        email: user.email,
        uid: user.uid,
        plan: selectedPlan,
      });

      if (res.data.ok) {
        alert(`✅ ${user.email} approved successfully!`);
        fetchUsers();
      } else {
        alert(`❌ Approval failed: ${res.data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert("❌ Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  /* 🔴 Reject User */
  const rejectUser = async (user) => {
    try {
      setLoading(true);
      const res = await adminUsersFn({
        action: "reject",
        email: user.email,
        uid: user.uid,
      });

      if (res.data.ok) {
        alert(`🚫 ${user.email} rejected.`);
        fetchUsers();
      } else {
        alert(`❌ Rejection failed: ${res.data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* 🧭 Navigation */
  const goToPlans = () => navigate("/plan");
  const goToDashboard = () => navigate("/dashboard");

  /* 🚀 Load on Page Mount */
  useEffect(() => {
    document.title = "Admin Control Panel — PRIMEXA";
    const userRole = localStorage.getItem("primexaRole") || "admin";
    setRole(userRole);
    fetchUsers();
  }, []);

  /* 🔒 Logout */
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  /* 🖥️ UI */
  return (
    <div className="min-h-screen bg-black text-yellow-300 p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-yellow-600 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-sm text-yellow-400 mt-1">
            Manage user approvals, roles, and plans
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={goToPlans}
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
          >
            Manage Plans
          </button>

          {(role === "superadmin" ||
            (localStorage.getItem("primexaUser") &&
              localStorage
                .getItem("primexaUser")
                .includes("primexa1967@gmail.com"))) && (
            <button
              onClick={goToDashboard}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Go to Dashboard
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Pending Users */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">🕓 Pending Users</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-400">No pending users.</p>
        ) : (
          <table className="w-full text-sm border border-yellow-800">
            <thead className="bg-yellow-800/40 text-yellow-300">
              <tr>
                <th className="p-2">Name</th>
                <th>Email</th>
                <th>Device</th>
                <th>Plan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.email} className="border-t border-yellow-700">
                  <td className="p-2">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="truncate max-w-xs">{user.deviceId}</td>
                  <td>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="bg-black border border-yellow-700 text-yellow-300 rounded p-1"
                    >
                      <option value="plan90">90 Days</option>
                      <option value="plan180">180 Days</option>
                      <option value="plan365">365 Days</option>
                    </select>
                  </td>
                  <td className="space-x-2">
                    <button
                      onClick={() => approveUser(user)}
                      className="bg-green-500 text-black px-3 py-1 rounded hover:bg-green-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser(user)}
                      className="bg-red-500 text-black px-3 py-1 rounded hover:bg-red-400"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Active Users */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">✅ Active Users</h2>
        {activeUsers.length === 0 ? (
          <p className="text-gray-400">No active users found.</p>
        ) : (
          <table className="w-full text-sm border border-yellow-800">
            <thead className="bg-yellow-800/40 text-yellow-300">
              <tr>
                <th className="p-2">Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user.email} className="border-t border-yellow-700">
                  <td className="p-2">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.plan}</td>
                  <td>
                    {user.expiryDate
                      ? new Date(user.expiryDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {message && (
        <div className="mt-6 text-center text-yellow-400">{message}</div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center text-yellow-300 text-lg">
          Processing…
        </div>
      )}
    </div>
  );
}
