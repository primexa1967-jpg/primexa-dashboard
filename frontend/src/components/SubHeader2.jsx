// frontend/src/components/SubHeader2.jsx
import React, { useState } from "react";

export default function SubHeader2() {
  const indices = ["Nifty50", "BankNifty", "FinNifty", "MidcapNifty", "Sensex"];
  const [active, setActive] = useState("Nifty50");

  return (
    <div className="fixed top-28 left-0 w-full bg-gray-900 text-gray-200 flex overflow-x-auto px-2 py-1 border-b border-gray-700 z-30 text-xs">
      {indices.map((index) => (
        <div
          key={index}
          className={`px-3 py-1 mx-1 cursor-pointer whitespace-nowrap rounded ${
            active === index ? "bg-yellow-500 text-black" : "hover:bg-gray-700"
          }`}
          onClick={() => setActive(index)}
        >
          {index}
        </div>
      ))}
      <div className="ml-auto pr-2">
        Expiry:{" "}
        <select className="bg-gray-700 rounded px-1 py-0.5 ml-1">
          <option>2025-12-04</option>
          <option>2025-12-11</option>
          <option>2025-12-18</option>
        </select>
      </div>
    </div>
  );
}
