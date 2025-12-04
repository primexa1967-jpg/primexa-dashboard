// frontend/src/components/OptionLadder/OptionLadder.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import OptionLadderHeader from "./OptionLadderHeader";
import OptionLadderRow from "./OptionLadderRow";
import OptionLadderSummary from "./OptionLadderSummary";

const BASE = "https://asia-south1-fnodatadashboardstreamlite.cloudfunctions.net";

export default function OptionLadder({ symbol = "NIFTY", expiry }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [spot, setSpot] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE}/fetchOptionLadder`, {
        params: { symbol, expiry },
      });
      setRows(res.data.rows || []);
      setSummary(res.data.summary || {});
      setSpot(res.data.spot || 0);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Option Ladder:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(timer);
  }, [symbol, expiry]);

  const atmStrike =
    rows.length > 0
      ? rows.reduce((prev, cur) =>
          Math.abs(cur.strike - spot) < Math.abs(prev.strike - spot) ? cur : prev
        ).strike
      : 0;

  return (
    <div
      className="bg-black text-xs md:text-sm text-gray-300 min-h-screen pt-52 pb-20"
      aria-busy={loading}
    >
      <OptionLadderHeader />

      {loading ? (
        <div className="flex justify-center items-center py-10 text-yellow-400 animate-pulse">
          Loading live data…
        </div>
      ) : (
        <div>
          {rows.map((row) => (
            <OptionLadderRow key={row.strike} row={row} isATM={row.strike === atmStrike} />
          ))}
          <OptionLadderSummary summary={summary} />
        </div>
      )}
    </div>
  );
}
