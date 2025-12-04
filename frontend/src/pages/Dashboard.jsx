// frontend/src/pages/Dashboard.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import SubHeader1 from "../components/SubHeader1";
import SubHeader2 from "../components/SubHeader2";
import SubHeader3 from "../components/SubHeader3";
import OptionLadder from "../components/OptionLadder/OptionLadder.jsx";
import Footer from "../components/Footer";
import "../style.css";

export default function Dashboard() {
  const [symbol, setSymbol] = useState("Nifty50"); // 🔹 Use display name, matches SubHeader2 default
  const [expiry, setExpiry] = useState("2025-12-04");

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* 🔹 Fixed global header (optional if you have one) */}
      <Header />

      {/* 🔹 Three-layer subheaders */}
      <SubHeader1 />
      <SubHeader2 onSymbolChange={setSymbol} onExpiryChange={setExpiry} />
      <SubHeader3 symbol={symbol} expiry={expiry} />

      {/* 🔹 Main Option Ladder */}
      <div className="pt-52 pb-24">
        <OptionLadder symbol={symbol} expiry={expiry} />
      </div>

      {/* 🔹 Footer */}
      <Footer />
    </div>
  );
}
