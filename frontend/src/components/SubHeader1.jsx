// frontend/src/components/SubHeader1.jsx
import React, { useState, useEffect } from "react";

export default function SubHeader1({
  sentiment = { bull: 43, neutral: 18, bear: 39 },
  refreshInterval = 5,
  connected = true, // true = connected, false = disconnected
}) {
  const [timer, setTimer] = useState(refreshInterval);
  const [blink, setBlink] = useState(false);

  // ⏱ Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t <= 1 ? refreshInterval : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // ✨ Blink when < 3 s left
  useEffect(() => {
    setBlink(timer < 3);
  }, [timer]);

  // 🌐 Connection status color + label
  const connectionColor = connected
    ? "bg-green-500 text-black"
    : "bg-red-500 text-white animate-pulse";
  const connectionLabel = connected ? "Connected" : "Reconnecting…";

  return (
    <div className="fixed top-16 left-0 w-full bg-gray-800 text-white flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-1 border-b border-gray-700 z-40 text-[10px] sm:text-xs md:text-sm">
      
      {/* 🔹 Time Frame Selector */}
      <div className="flex items-center flex-wrap">
        <span>Time Frame:</span>
        <select className="bg-gray-700 rounded px-1 py-0.5 ml-1 text-white text-[10px] sm:text-xs focus:outline-none">
          {["1m", "3m", "5m", "15m", "30m", "60m", "1D"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <span className="ml-1">| Auto Mode</span>
      </div>

      {/* 🔹 Sentiment Summary */}
      <div className="flex-1 text-center mt-1 sm:mt-0">
        <div className="flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-3">
          <span className="text-green-400 font-semibold">
            🐂 Bull {sentiment.bull}%
          </span>
          <span className="text-gray-300">⚪ Neutral {sentiment.neutral}%</span>
          <span className="text-red-400 font-semibold">
            🐻 Bear {sentiment.bear}%
          </span>
        </div>
      </div>

      {/* 🔹 Countdown + Connection */}
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        <div
          className={`${
            blink ? "text-yellow-400 animate-pulse" : "text-white"
          }`}
        >
          Next Update in {timer}s
        </div>
        <div
          className={`rounded px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold ${connectionColor}`}
        >
          {connectionLabel}
        </div>
      </div>
    </div>
  );
}
