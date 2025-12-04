import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE = "https://generatefileasia-ji3e37go5a-el.a.run.app";

export default function SubHeader2({ onSymbolChange, onExpiryChange }) {
  const indices = ["Nifty50", "BankNifty", "FinNifty", "MidcapNifty", "Sensex", "Bankex"];
  const [active, setActive] = useState("Nifty50");
  const [expiryList, setExpiryList] = useState([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [spot, setSpot] = useState(null);
  const [prevSpot, setPrevSpot] = useState(null);
  const [changePct, setChangePct] = useState(0);
  const [trendColor, setTrendColor] = useState("text-gray-400");
  const [trendIcon, setTrendIcon] = useState("•");
  const [errorCount, setErrorCount] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [totalPCR, setTotalPCR] = useState(null);
  const intervalRef = useRef(null);

  // Convert visible index name to DHAN symbol
  const symbolMap = {
    Nifty50: "NIFTY",
    BankNifty: "BANKNIFTY",
    FinNifty: "FINNIFTY",
    MidcapNifty: "MIDCPNIFTY",
    Sensex: "SENSEX",
    Bankex: "BANKEX",
  };
  const dhanSymbol = symbolMap[active] || "NIFTY";

  // 🔹 Countdown
  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c <= 1 ? 30 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔹 Fetch ladder data
  useEffect(() => {
    const fetchData = async (retry = 0) => {
      try {
        const res = await axios.get(`${BASE}/fetchOptionLadder?symbol=${dhanSymbol}`);
        if (!res.data) return;

        const nextExpiries = Array.isArray(res.data.expiry)
          ? res.data.expiry
          : [res.data.expiry];
        setExpiryList(nextExpiries);

        // choose nearest future expiry
        const now = new Date();
        const nearest = nextExpiries
          .map((e) => new Date(e))
          .filter((d) => d > now)
          .sort((a, b) => a - b)[0];
        const finalExp = nearest
          ? nearest.toISOString().slice(0, 10)
          : nextExpiries[0];
        setSelectedExpiry(finalExp);

        const newSpot = res.data.spot || 0;
        if (spot) {
          const pct = ((newSpot - spot) / spot) * 100;
          setChangePct(pct.toFixed(2));
          setTrendIcon(newSpot > spot ? "▲" : newSpot < spot ? "▼" : "•");
          setTrendColor(
            newSpot > spot
              ? "text-green-400"
              : newSpot < spot
              ? "text-red-400"
              : "text-gray-400"
          );
        }
        setPrevSpot(spot);
        setSpot(newSpot);

        setTotalPCR(res.data.summary?.pcr?.toFixed(2) || null);
        setErrorCount(0);
        localStorage.setItem("primexa_lastSpotData", JSON.stringify(res.data));
      } catch (err) {
        setErrorCount((e) => e + 1);
        if (errorCount >= 2) {
          const cached = localStorage.getItem("primexa_lastSpotData");
          if (cached) {
            const data = JSON.parse(cached);
            setSpot(data.spot);
            setTotalPCR(data.summary?.pcr?.toFixed(2) || null);
            setTrendColor("text-yellow-400");
            setTrendIcon("⚠");
          }
        }
      }
      setCountdown(30);
    };

    // start / stop interval when visible
    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchData, 30000);
    };
    const stopInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    fetchData();
    startInterval();

    const handleVis = () => (document.hidden ? stopInterval() : startInterval());
    document.addEventListener("visibilitychange", handleVis);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [active]);

  // 🔹 Dynamic tab color
  const getTabColor = (index) => {
    if (index !== active) return "hover:bg-gray-700 hover:text-white";
    if (trendColor.includes("green")) return "bg-green-500 text-black font-semibold";
    if (trendColor.includes("red")) return "bg-red-500 text-black font-semibold";
    if (trendColor.includes("yellow")) return "bg-yellow-500 text-black font-semibold";
    return "bg-gray-600 text-black";
  };

  // 🔹 PCR color logic
  const getPcrColor = () => {
    if (!totalPCR) return "text-gray-400";
    const p = parseFloat(totalPCR);
    if (p > 1.2) return "text-green-400";
    if (p >= 0.8 && p <= 1.2) return "text-yellow-400";
    return "text-red-400";
  };

  // 🔹 Timer color logic
  const getTimerColor = () =>
    countdown <= 5
      ? "text-red-400"
      : countdown <= 10
      ? "text-yellow-400"
      : "text-gray-400";

  // 🔹 propagate active symbol + expiry upward
  useEffect(() => {
    onSymbolChange?.(dhanSymbol);
  }, [dhanSymbol]);
  useEffect(() => {
    if (selectedExpiry) onExpiryChange?.(selectedExpiry);
  }, [selectedExpiry]);

  return (
    <div className="fixed top-28 left-0 w-full bg-gray-900 text-gray-200 flex items-center overflow-x-auto px-2 py-1 border-b border-gray-700 z-30 text-xs md:text-sm">
      {/* Index Tabs */}
      <div className="flex flex-row items-center space-x-1">
        {indices.map((index) => (
          <div
            key={index}
            onClick={() => {
              setActive(index);
              setExpiryList([]);
              setSelectedExpiry("");
              setSpot(null);
            }}
            className={`px-3 py-1 cursor-pointer whitespace-nowrap rounded-md transition-colors duration-300 shadow-sm ${getTabColor(
              index
            )}`}
          >
            {index}
          </div>
        ))}
      </div>

      {/* Expiry + Spot + PCR + Timer */}
      <div className="ml-auto flex items-center space-x-3 pr-2">
        {/* Expiry */}
        <div className="flex items-center space-x-1">
          <span className="hidden sm:inline text-gray-400">Expiry:</span>
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="bg-gray-700 text-gray-200 rounded px-1 py-0.5 focus:outline-none border border-gray-600"
          >
            {expiryList.length === 0 ? (
              <option>Loading…</option>
            ) : (
              expiryList.map((exp) => (
                <option
                  key={exp}
                  value={exp}
                  className={
                    exp === selectedExpiry
                      ? "text-yellow-400 font-semibold"
                      : "text-white"
                  }
                >
                  {exp}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Spot */}
        {spot && (
          <div className="flex items-center gap-1">
            <span className={`${trendColor} font-semibold`}>
              {spot.toFixed(2)} {trendIcon}
            </span>
            <span
              className={`${
                trendColor === "text-green-400"
                  ? "text-green-300"
                  : trendColor === "text-red-400"
                  ? "text-red-300"
                  : "text-yellow-300"
              } text-[10px] md:text-xs`}
            >
              ({changePct}%)
            </span>
          </div>
        )}

        {/* PCR */}
        {totalPCR && (
          <div
            title="PCR = Σ(PE OI) / Σ(CE OI)"
            className={`font-semibold text-[10px] md:text-xs ${getPcrColor()}`}
          >
            PCR: {totalPCR}
          </div>
        )}

        {/* Timer */}
        <div className={`${getTimerColor()} text-[10px] md:text-xs`}>
          ↻ {countdown}s
        </div>
      </div>
    </div>
  );
}


