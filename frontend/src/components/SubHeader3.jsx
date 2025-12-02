// frontend/src/components/SubHeader3.jsx
import React from "react";

export default function SubHeader3() {
  return (
    <div className="fixed top-40 left-0 w-full bg-gray-800 text-white flex justify-center items-center border-b border-gray-700 py-1 z-20 text-xs">
      <span className="text-green-400 mr-2">CE</span>
      <span className="mx-2">Nifty50 ▲</span>
      <span className="text-red-400 ml-2">PE</span>
    </div>
  );
}
