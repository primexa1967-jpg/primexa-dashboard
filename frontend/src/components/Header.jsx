// frontend/src/components/Header.jsx
import React from "react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 text-white border-b border-yellow-500 z-50">
      <div className="text-center font-bold text-xl py-2">
        OPTION BUYER’s DASHBOARD
      </div>
      <div className="flex justify-between items-center px-4 pb-2 text-sm">
        <div className="text-center flex-1 text-yellow-400">
          PRIMEXA Learning Series — WhatsApp 9836001579
        </div>
        <div className="space-x-2">
          <button className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">
            Refresh
          </button>
          <button className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
