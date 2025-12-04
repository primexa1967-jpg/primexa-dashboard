import React, { useEffect, useState, useRef } from "react";

export default function SubHeader3({ symbol = "NIFTY", expiry = "2025-12-04" }) {
  const [spot, setSpot] = useState(0);
  const [spotChange, setSpotChange] = useState(0);
  const [spotPercent, setSpotPercent] = useState(0);
  const [cePerc, setCePerc] = useState(0);
  const [pePerc, setPePerc] = useState(0);
  const [pcr, setPcr] = useState(1.0);
  const [status, setStatus] = useState("Neutral");
  const [countdown, setCountdown] = useState(30);
  const [avgIV, setAvgIV] = useState(0);
  const [avgOIChange, setAvgOIChange] = useState(0);
  const [avgGamma, setAvgGamma] = useState(0);
  const prevData = useRef({ spot: 0, pcr: 1.0 });

  const DHAN_API = "https://api.dhan.co/market/v2";
  const TOKEN = "YOUR_DHAN_ACCESS_TOKEN"; // keep secure (.env)

  const fetchData = async (retry = 0) => {
    try {
      const [chainRes, quoteRes] = await Promise.all([
        fetch(`${DHAN_API}/option-chain?symbol=${symbol}&expiry=${expiry}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }),
        fetch(`${DHAN_API}/quotes?symbol=${symbol}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }),
      ]);

      // Retry on rate-limit
      if (chainRes.status === 429 && retry < 3) {
        setTimeout(() => fetchData(retry + 1), 5000);
        return;
      }

      const chain = await chainRes.json();
      const quote = await quoteRes.json();

      if (!chain?.data || !quote?.last_price) return;
      const spotNow = quote.last_price;
      const ceTotalOi = chain.data.reduce((a, x) => a + (x.call_option?.open_interest || 0), 0);
      const peTotalOi = chain.data.reduce((a, x) => a + (x.put_option?.open_interest || 0), 0);
      const ceTotalVol = chain.data.reduce((a, x) => a + (x.call_option?.volume || 0), 0);
      const peTotalVol = chain.data.reduce((a, x) => a + (x.put_option?.volume || 0), 0);

      const pcrNow = peTotalOi / (ceTotalOi || 1);
      const ceStrength = ((ceTotalOi + ceTotalVol) / (ceTotalOi + ceTotalVol + peTotalOi + peTotalVol)) * 100;
      const peStrength = 100 - ceStrength;

      const spotDiff = spotNow - (prevData.current.spot || spotNow);
      const spotPct = prevData.current.spot ? (spotDiff / prevData.current.spot) * 100 : 0;

      // calculate averages
      const totalIV = chain.data.reduce(
        (a, x) => a + ((x.call_option?.iv || 0) + (x.put_option?.iv || 0)) / 2,
        0
      );
      const totalOIChange = chain.data.reduce(
        (a, x) =>
          a +
          (((x.call_option?.oi_change_percent || 0) +
            (x.put_option?.oi_change_percent || 0)) /
            2),
        0
      );
      const totalGamma = chain.data.reduce(
        (a, x) => a + ((x.call_option?.gamma || 0) + (x.put_option?.gamma || 0)) / 2,
        0
      );

      const n = chain.data.length || 1;
      setAvgIV(totalIV / n);
      setAvgOIChange(totalOIChange / n);
      setAvgGamma(totalGamma / n);

      let mood = "Neutral";
      if (pcrNow > 1.2) mood = "Bullish";
      else if (pcrNow < 0.8) mood = "Bearish";

      setSpot(spotNow);
      setSpotChange(spotDiff);
      setSpotPercent(spotPct);
      setPcr(pcrNow);
      setCePerc(ceStrength.toFixed(1));
      setPePerc(peStrength.toFixed(1));
      setStatus(mood);

      prevData.current = { spot: spotNow, pcr: pcrNow };
      localStorage.setItem(
        "primexa_sub3_cache",
        JSON.stringify({ spotNow, pcrNow, ceStrength, peStrength, mood })
      );
    } catch (err) {
      const cached = localStorage.getItem("primexa_sub3_cache");
      if (cached) {
        const c = JSON.parse(cached);
        setSpot(c.spotNow);
        setPcr(c.pcrNow);
        setCePerc(c.ceStrength);
        setPePerc(c.peStrength);
        setStatus(c.mood);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    const timer = setInterval(() => setCountdown((c) => (c <= 1 ? 30 : c - 1)), 1000);
    const handleVis = () => document.hidden && clearInterval(interval);
    document.addEventListener("visibilitychange", handleVis);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [symbol, expiry]);

  const pcrColor =
    pcr > 1.2
      ? "text-green-400"
      : pcr >= 1.0
      ? "text-lime-400"
      : pcr >= 0.8
      ? "text-yellow-400"
      : pcr >= 0.6
      ? "text-pink-400"
      : "text-red-400";

  const spotColor = spotChange > 0 ? "text-green-400" : spotChange < 0 ? "text-red-400" : "text-gray-200";
  const timerColor =
    countdown <= 5
      ? "text-red-400"
      : countdown <= 10
      ? "text-yellow-400"
      : "text-gray-400";

  return (
    <div
      className={`fixed top-40 left-0 w-full transition-all duration-500 ${
        status === "Bullish"
          ? "bg-gradient-to-r from-green-900 to-gray-800"
          : status === "Bearish"
          ? "bg-gradient-to-r from-red-900 to-gray-800"
          : "bg-gray-800"
      } text-gray-200 border-b border-gray-700 z-20 text-xs md:text-sm`}
    >
      <div className="flex justify-between items-center px-3 py-1">
        {/* CE/PE sentiment */}
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-semibold">CE {cePerc}%</span>
          <span className="text-gray-400">•</span>
          <span className="text-red-400 font-semibold">PE {pePerc}%</span>
        </div>

        {/* Spot + PCR + Mood */}
        <div className="flex items-center space-x-2">
          <span className={`${spotColor} font-semibold`}>
            {symbol} {spotChange > 0 ? "▲" : spotChange < 0 ? "▼" : "•"} {spot.toFixed(2)}{" "}
            <span className="text-gray-400">({spotPercent.toFixed(2)}%)</span>
          </span>
          <span title="PCR = Σ(PE OI) / Σ(CE OI)" className={`${pcrColor} font-semibold`}>
            PCR {pcr.toFixed(2)}
          </span>
          <span
            className={`${
              status === "Bullish"
                ? "text-green-400"
                : status === "Bearish"
                ? "text-red-400"
                : "text-yellow-300"
            } font-semibold`}
          >
            {status}
          </span>
        </div>

        {/* Timer */}
        <div className={`${timerColor} text-[10px] md:text-xs`}>↻ {countdown}s</div>
      </div>

      {/* Mini stats row */}
      <div className="flex justify-center gap-4 text-[10px] md:text-xs text-gray-300 pb-1">
        <span>Avg IV {avgIV.toFixed(2)}%</span>
        <span>Avg OI Chg {avgOIChange.toFixed(2)}%</span>
        <span>Avg Γ {avgGamma.toFixed(5)}</span>
      </div>
    </div>
  );
}
