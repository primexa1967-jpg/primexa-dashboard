import React from "react";

export default function OptionLadderHeader() {
  return (
    <div className="grid grid-cols-17 text-center bg-gray-800 text-yellow-300 border-b border-yellow-700 sticky top-40 z-10">
      {/* CE Side */}
      <div className="col-span-8 flex justify-around border-r border-yellow-700 py-1">
        <span>Built Up</span>
        <span>TVitm / IV</span>
        <span>Vol</span>
        <span>Delta</span>
        <span>OI / OI Chg</span>
        <span>OI Chg %</span>
        <span>LTP / LTP Chg</span>
        <span>Γ</span>
      </div>

      {/* Center Strike */}
      <div className="col-span-1 bg-yellow-900 text-black font-semibold border-x border-yellow-700 py-1">
        Strike / PCR
      </div>

      {/* PE Side */}
      <div className="col-span-8 flex justify-around border-l border-yellow-700 py-1">
        <span>Γ</span>
        <span>LTP / LTP Chg</span>
        <span>OI Chg %</span>
        <span>OI / OI Chg</span>
        <span>Delta</span>
        <span>Vol</span>
        <span>TVitm / IV</span>
        <span>Built Up</span>
      </div>
    </div>
  );
}
