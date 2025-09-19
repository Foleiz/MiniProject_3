import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/ManageRoles.css";

// Component for the "เมนูหลัก" (Main Menu) tab
const MainMenuTab = () => {
  return (
    <div className="content-tab">
      <div className="tab-header">
        <NavLink to="/">
          <span className="home-icon">🏠</span>
        </NavLink>
        <span className="tab-title">การกำหนดสิทธิ์</span>
      </div>
      <div className="roles-table">
        <table className="permissions-table">
          <thead>
            <tr>
              <th></th>
              <th>ตำแหน่ง</th>
              <th>แผนก</th>
              <th>Driver</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>การจัดการสิทธิ์</td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td></td>
            </tr>
            <tr>
              <td>การกำหนดสิทธิ์</td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td></td>
            </tr>
            <tr>
              <td>การจัดการเส้นทาง</td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td></td>
            </tr>
            <tr>
              <td>ดูรายงาน</td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td></td>
            </tr>
            <tr>
              <td>หน้าจองรถ</td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td>
                <input type="checkbox" className="permission-checkbox" />
              </td>
              <td>
                <input
                  type="checkbox"
                  className="permission-checkbox"
                  defaultChecked
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="no-data-placeholder">
        <h3>ไม่มีข้อมูล</h3>
      </div>
    </div>
  );
};

// Component for the "เมนูตำแหน่ง" (Position Menu) tab
const PositionMenuTab = () => {
  return (
    <div className="content-tab">
      <div className="search-and-buttons">
        <input
          type="text"
          placeholder="ค้นหาตามชื่อ,ตำแหน่ง"
          className="search-input"
        />
      </div>
      <div className="roles-table">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" className="select-all-checkbox" />
              </th>
              <th>รหัสตำแหน่ง</th>
              <th>ชื่อตำแหน่ง</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="checkbox" className="row-checkbox" />
              </td>
              <td>P001</td>
              <td>Admin</td>
              <td>
                <button className="setting-btn">⚙️</button>
              </td>
            </tr>
            <tr>
              <td>
                <input type="checkbox" className="row-checkbox" />
              </td>
              <td>P002</td>
              <td>Driver</td>
              <td>
                <button className="setting-btn">⚙️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component for the "เมนูแผนก" (Department Menu) tab
const DepartmentMenuTab = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ id: "", name: "" });
  const [editingId, setEditingId] = useState(null);

  // Load departments from database
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:3000/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "ไม่สามารถดึงข้อมูลแผนกได้", "error");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await axios.put(`http://localhost:3000/departments/${editingId}`, form);
        Swal.fire("สำเร็จ", "อัปเดตข้อมูลแผนกแล้ว!", "success");
      } else {
        // Add
        if (form.id && form.name) {
          await axios.post("http://localhost:3000/departments", form);
          Swal.fire("สำเร็จ", "เพิ่มข้อมูลแผนกใหม่แล้ว!", "success");
        }
      }
      setForm({ id: "", name: "" });
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "การดำเนินการล้มเหลว", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/departments/${id}`);
        Swal.fire("ลบแล้ว!", "ข้อมูลแผนกถูกลบเรียบร้อยแล้ว", "success");
        fetchDepartments();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "การลบล้มเหลว", "error");
      }
    }
  };

  const handleEdit = (dept) => {
    setForm(dept);
    setEditingId(dept.id);
  };

  return (
    <div className="content-tab">
      <div className="search-and-buttons">
        <input
          type="text"
          placeholder="ค้นหาตามชื่อ,แผนก"
          className="search-input"
        />
      </div>
      <form className="add-form-container" onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="id"
          placeholder="รหัสแผนก"
          value={form.id}
          onChange={handleFormChange}
          disabled={!!editingId}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="ชื่อแผนก"
          value={form.name}
          onChange={handleFormChange}
          required
        />
        <button type="submit">{editingId ? "อัปเดตแผนก" : "เพิ่มแผนก"}</button>
      </form>
      <div className="roles-table">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" className="select-all-checkbox" />
              </th>
              <th>รหัสแผนก</th>
              <th>ชื่อแผนก</th>
              <th>ตัวเลือก</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>
                  <input type="checkbox" className="row-checkbox" />
                </td>
                <td>{dept.id}</td>
                <td>{dept.name}</td>
                <td>
                  <button
                    className="setting-btn"
                    onClick={() => handleEdit(dept)}
                  >
                    ⚙️
                  </button>
                  <button
                    className="delete-role-btn"
                    onClick={() => handleDelete(dept.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ManageRoles() {
  const [activeTab, setActiveTab] = useState("main"); // 'main', 'position', 'department'

  return (
    <div className="manage-roles-content">
      <div className="header-section">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ,แผนก"
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
        <div className="user-info">
          <span className="settings-icon">⚙️</span>
          <span className="notification-icon">🔔</span>
          <div className="profile">
            <span className="profile-icon">👤</span>
            <div className="profile-text">
              <span className="profile-name">Admin2</span>
              <span className="profile-role">Admin</span>
            </div>
          </div>
        </div>
      </div>
      <div className="tab-buttons">
        <button
          className={activeTab === "main" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("main")}
        >
          เมนูหลัก
        </button>
        <button
          className={
            activeTab === "position" ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab("position")}
        >
          เมนูตำแหน่ง
        </button>
        <button
          className={
            activeTab === "department" ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab("department")}
        >
          เมนูแผนก
        </button>
      </div>

      <div className="content-display">
        {activeTab === "main" && <MainMenuTab />}
        {activeTab === "position" && <PositionMenuTab />}
        {activeTab === "department" && <DepartmentMenuTab />}
      </div>
    </div>
  );
}
