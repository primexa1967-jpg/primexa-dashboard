import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="text-center text-yellow-400 bg-black min-h-screen flex items-center justify-center">
            Loading PRIMEXA...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
