// frontend/src/components/OptionLadder.jsx
import React from "react";

export default function OptionLadder() {
  const rows = Array.from({ length: 17 });

  return (
    <div className="pt-52 pb-20 text-xs">
      {rows.map((_, i) => (
        <div
          key={i}
          className={`flex justify-between px-4 py-1 ${
            i === 8 ? "border-b border-yellow-400 font-bold" : "border-b border-gray-700"
          }`}
        >
          <div className="text-green-400">Built-Up</div>
          <div className="text-gray-400">Strike {(18000 + i * 50).toFixed(0)}</div>
          <div className="text-red-400">LTP</div>
        </div>
      ))}
    </div>
  );
}
