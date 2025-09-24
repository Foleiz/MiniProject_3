import React, { useState } from "react";
import ManageEmployees from "./ManageEmployees";
import ManageUsers from "./ManageUsers";
import "../css/ManageEmpAndUser.css";

export default function ManageEmployeesAndUsers() {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="manage-emp-container">
      {/* Navigation Tabs */}
      <div className="tab-navigation-container">
        <div className="tab-list">
          <button
            onClick={() => setActiveTab('employees')}
            className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
          >
            จัดการพนักงาน
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          >
            จัดการผู้ใช้งาน
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'employees' && <ManageEmployees />}
      {activeTab === 'users' && <ManageUsers />}
    </div>
  );
}