// frontend/src/pages/Dashboard.jsx
import React from "react";
import Header from "../components/Header";
import SubHeader1 from "../components/SubHeader1";
import SubHeader2 from "../components/SubHeader2";
import SubHeader3 from "../components/SubHeader3";
import OptionLadder from "../components/OptionLadder";
import Footer from "../components/Footer";
import "../style.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Fixed top sections */}
      <Header />
      <SubHeader1 />
      <SubHeader2 />
      <SubHeader3 />

      {/* Scrollable main content */}
      <div className="main-scroll-area">
        <OptionLadder />
      </div>

      <Footer />
    </div>
  );
}
