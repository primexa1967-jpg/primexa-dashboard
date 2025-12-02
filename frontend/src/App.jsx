import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

// ✅ Lazy load heavy pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const PlanPage = lazy(() => import("./pages/PlanPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-yellow-400 bg-black min-h-screen flex items-center justify-center">
          Loading PRIMEXA...
        </div>
      }
    >
      <Routes>
        {/* Public Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Plan Selection (after Google login) */}
        <Route path="/plan" element={<PlanPage />} />

        {/* Registration page (after payment & code received) */}
        <Route path="/register" element={<RegisterPage />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Admin – Manage Plans */}
        <Route path="/admin/plans" element={<AdminPlans />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="text-center text-red-400 bg-black min-h-screen flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold mb-2">404 — Page Not Found</h1>
              <a
                href="/"
                className="text-yellow-400 underline hover:text-yellow-300"
              >
                Return to Login
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
