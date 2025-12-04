import React from "react";

export default function OptionLadderRow({ row, isATM }) {
  const { CE, PE, strike } = row;

  const builtUpColor = (type) => {
    switch (type) {
      case "LB": return "text-green-400";
      case "SC": return "text-green-300";
      case "LU": return "text-red-400";
      case "SB": return "text-red-300";
      default: return "text-gray-400";
    }
  };

  return (
    <div
      className={`grid grid-cols-17 text-center border-b ${
        isATM ? "border-yellow-400 bg-yellow-600/10" : "border-gray-800"
      }`}
    >
      {/* CE side */}
      <div className={`col-span-8 flex justify-around py-1`}>
        <span className={builtUpColor(CE.builtUp)}>{CE.builtUp}</span>
        <span>{CE.tvitm?.toFixed(2)} / {CE.iv?.toFixed(2)}</span>
        <span>{CE.volume}</span>
        <span>{CE.delta?.toFixed(2)}</span>
        <span>{CE.oi}/{CE.oi_change}</span>
        <span
          className={
            CE.oi_change_percent > 10
              ? "text-green-400"
              : CE.oi_change_percent < -10
              ? "text-red-400"
              : "text-gray-300"
          }
        >
          {CE.oi_change_percent?.toFixed(2)}%
        </span>
        <span
          className={
            CE.ltp_change > 0
              ? "text-green-400"
              : CE.ltp_change < 0
              ? "text-red-400"
              : "text-gray-300"
          }
        >
          {CE.ltp}/{CE.ltp_change}
        </span>
        <span>{CE.gamma?.toExponential(2)}</span>
      </div>

      {/* Strike */}
      <div className="col-span-1 bg-black text-yellow-300 font-bold border-x border-yellow-700 py-1">
        {strike}
      </div>

      {/* PE side */}
      <div className={`col-span-8 flex justify-around py-1`}>
        <span>{PE.gamma?.toExponential(2)}</span>
        <span
          className={
            PE.ltp_change > 0
              ? "text-red-400"
              : PE.ltp_change < 0
              ? "text-green-400"
              : "text-gray-300"
          }
        >
          {PE.ltp}/{PE.ltp_change}
        </span>
        <span
          className={
            PE.oi_change_percent > 10
              ? "text-red-400"
              : PE.oi_change_percent < -10
              ? "text-green-400"
              : "text-gray-300"
          }
        >
          {PE.oi_change_percent?.toFixed(2)}%
        </span>
        <span>{PE.oi}/{PE.oi_change}</span>
        <span>{PE.delta?.toFixed(2)}</span>
        <span>{PE.volume}</span>
        <span>{PE.tvitm?.toFixed(2)} / {PE.iv?.toFixed(2)}</span>
        <span className={builtUpColor(PE.builtUp)}>{PE.builtUp}</span>
      </div>
    </div>
  );
}
