import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ---------- BACKEND FUNCTION ENDPOINT ---------- */
const BASE = "https://generatefileasia-ji3e37go5a-el.a.run.app";

export default function AdminPage() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("plan90");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  /* ---------- FETCH USERS (pending + active) ---------- */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [pending, active] = await Promise.all([
        axios.get(`${BASE}/fetchPendingUsers`),
        axios.get(`${BASE}/fetchActiveUsers`),
      ]);
      setPendingUsers(pending.data || []);
      setActiveUsers(active.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- APPROVE USER ---------- */
  const approveUser = async (user) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE}/generateFileAsia`, {
        action: "approve",
        email: user.email,
        name: user.name,
        uid: user.uid,
        plan: selectedPlan,
        approvedBy: "admin",
      });
      if (res.status === 200) {
        alert(`✅ ${user.email} approved successfully!`);
        fetchUsers();
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert("❌ Error approving user.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- REJECT USER ---------- */
  const rejectUser = async (user) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE}/generateFileAsia`, {
        action: "reject",
        email: user.email,
        uid: user.uid,
      });
      if (res.status === 200) {
        alert(`🚫 ${user.email} rejected.`);
        fetchUsers();
      }
    } catch (err) {
      console.error("Rejection error:", err);
      alert("❌ Error rejecting user.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- NAVIGATION ---------- */
  const goToPlans = () => navigate("/admin/plans");

  /* ---------- LOAD DATA ON PAGE LOAD ---------- */
  useEffect(() => {
    document.title = "Admin Control Panel — PRIMEXA";
    const userRole = localStorage.getItem("primexaRole");
    setRole(userRole || "admin");
    fetchUsers();
  }, []);

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-black text-yellow-300 p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-yellow-600 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-sm text-yellow-400 mt-1">
            Manage user access, approvals, and plans
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={goToPlans}
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
          >
            Manage Plans
          </button>
          {role === "superadmin" && (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Dashboard
            </button>
          )}
        </div>
      </header>

      {/* Pending Users */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">🕓 Pending Users</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-400">No pending users found.</p>
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

      {/* Footer */}
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
