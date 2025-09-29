import React, { useState } from "react";
import "../css/ManageReport.css";
import Report1 from "./Report1";
import Report2 from "./Report2";
import Report3 from "./Report3";


export default function ManageReport() {
  const [activeTab, setActiveTab] = useState("report1");

  return (
    <div className="manage-report-container">
      {/* Navigation Tabs */}
      <div className="report-tab-navigation-container">
        <div className="report-tab-list">
          <button
            onClick={() => setActiveTab("report1")}
            className={`report-tab-button ${
              activeTab === "report1" ? "active" : ""
            }`}
          >
            รายงาน 1
          </button>
          <button
            onClick={() => setActiveTab("report2")}
            className={`report-tab-button ${
              activeTab === "report2" ? "active" : ""
            }`}
          >
            รายงาน 2
          </button>
           <button
            onClick={() => setActiveTab("report3")}
            className={`report-tab-button ${
              activeTab === "report3" ? "active" : ""
            }`}
          >
            รายงาน 3
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "report1" && <Report1 />}
      {activeTab === "report2" && <Report2 />}
      {activeTab === "report3" && <Report3 />}
    </div>
  );
}
