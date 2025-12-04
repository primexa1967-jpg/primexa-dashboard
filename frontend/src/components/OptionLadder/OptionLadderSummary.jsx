import React from "react";

export default function OptionLadderSummary({ summary }) {
  if (!summary) return null;
  const { ceVol, peVol, totalCEoi, totalPEoi } = summary;

  const pcr = totalCEoi && totalPEoi ? (totalPEoi / totalCEoi).toFixed(2) : "—";
  const pcrColor =
    pcr > 1.2
      ? "text-green-400"
      : pcr > 1.0
      ? "text-green-300"
      : pcr > 0.8
      ? "text-yellow-400"
      : pcr > 0.6
      ? "text-pink-400"
      : "text-red-400";

  return (
    <div className="bg-gray-900 text-yellow-300 border-t border-yellow-700 py-2 mt-4 text-xs">
      <div className="flex justify-around">
        <span>Vol CE: {ceVol}</span>
        <span>Vol PE: {peVol}</span>
        <span>Call OI: {totalCEoi}</span>
        <span>Put OI: {totalPEoi}</span>
        <span className={pcrColor}>PCR: {pcr}</span>
        <span>Alpha: {(summary.alpha || 0).toFixed(2)}</span>
        <span>Beta: {(summary.beta || 0).toFixed(2)}</span>
        <span>Vega: {(summary.vega || 0).toFixed(2)}</span>
      </div>
      <div className="text-center text-yellow-500 border-t border-yellow-600 mt-2 pt-1">
        Warning – This dashboard is strictly for learning and research purpose.
      </div>
    </div>
  );
}
