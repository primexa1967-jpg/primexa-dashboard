// frontend/src/components/SubHeader1.jsx
import React, { useState, useEffect } from "react";

export default function SubHeader1() {
  const [timer, setTimer] = useState(5);
  const [blink, setBlink] = useState(false);

  // Simple countdown simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) return 5;
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBlink(timer < 3);
  }, [timer]);

  return (
    <div className="fixed top-16 left-0 w-full bg-gray-800 text-white flex items-center justify-between px-4 py-1 border-b border-gray-700 z-40 text-xs">
      <div>
        Time Frame:{" "}
        <select className="bg-gray-700 rounded px-1 py-0.5 ml-1">
          <option>1m</option>
          <option>3m</option>
          <option>5m</option>
          <option>15m</option>
          <option>30m</option>
          <option>60m</option>
          <option>1D</option>
        </select>{" "}
        | Auto Mode
      </div>
      <div className="flex-1 text-center">
        <div className="flex justify-center space-x-2 items-center">
          <span className="text-green-400">🐂 Bull 43%</span>
          <span className="text-gray-400">⚪ Neutral 18%</span>
          <span className="text-red-400">🐻 Bear 39%</span>
        </div>
      </div>
      <div className={blink ? "text-yellow-400 animate-pulse" : "text-white"}>
        Next Update in {timer}s
      </div>
    </div>
  );
}
