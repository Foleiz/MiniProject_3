import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

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
        <button className="delete-btn">ลบ</button>
        <button className="add-btn">เพิ่ม</button>
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
        <button className="delete-btn">ลบ</button>
        <button
          className="add-btn"
          onClick={() => {
            setForm({ id: "", name: "" });
            setEditingId(null);
          }}
        >
          เพิ่ม
        </button>
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
      <style>{`
        .manage-roles-content {
          display: flex;
          flex-direction: column;
          padding: 20px;
          background-color: #ecf0f1;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          min-height: 80vh;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .left-header {
          display: flex;
          align-items: center;
        }
        
        .tab-buttons {
          display: flex;
          margin-bottom: 20px;
        }
        
        .tab-button {
          padding: 10px 25px;
          border: none;
          background-color: #f5f5f5;
          cursor: pointer;
          font-weight: bold;
          color: #777;
          border-radius: 8px;
          margin-right: 5px;
          transition: background-color 0.2s;
        }
        
        .tab-button.active {
          background-color: #d1e7d1;
          color: #333;
        }
        
        .tab-button.active:hover {
          background-color: #c0d8c0;
        }
        
        .content-tab {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .tab-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          background-color: #fff;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .home-icon {
          font-size: 24px;
          margin-right: 15px;
          color: #555;
        }

        .tab-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: #333;
        }

        .right-header button {
          padding: 10px 20px;
          border: none;
          border-radius: 20px;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
          transition: background-color 0.2s, transform 0.2s;
        }

        .right-header button:hover {
          transform: translateY(-2px);
        }

        .right-header .icon {
          margin-right: 5px;
        }

        .save-btn {
          background-color: #27ae60;
        }

        .save-btn:hover {
          background-color: #229954;
        }

        .add-btn {
          background-color: #1a73e8;
        }

        .add-btn:hover {
          background-color: #1664c0;
        }
        
        .delete-btn {
          background-color: #e74c3c;
          color: #fff;
          border-radius: 20px;
          padding: 10px 20px;
          border: none;
          margin-left: auto;
          margin-right: 10px;
        }

        .delete-btn:hover {
          background-color: #c0392b;
        }

        .search-and-buttons {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-input {
          flex-grow: 1;
          padding: 10px 15px;
          border-radius: 20px;
          border: 1px solid #ccc;
        }

        .roles-table {
          overflow-x: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .permissions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .permissions-table th,
        .permissions-table td {
          padding: 15px;
          text-align: center;
          border-right: 1px solid #f0f0f0;
          vertical-align: middle;
        }
        
        .permissions-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            border-bottom: 2px solid #ddd;
        }
        
        .permissions-table th:first-child,
        .permissions-table td:first-child {
          text-align: left;
          background-color: #f8f9fa;
          border-right: 2px solid #ddd;
          font-weight: bold;
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px;
        }

        .delete-role-btn {
          background: none;
          border: none;
          color: #e74c3c;
          cursor: pointer;
          font-size: 18px;
          transition: transform 0.2s;
        }

        .delete-role-btn:hover {
          transform: scale(1.2);
        }

        .permission-checkbox {
          transform: scale(1.5);
          cursor: pointer;
          accent-color: #2ecc71;
        }

        .select-all-checkbox, .row-checkbox {
          transform: scale(1.5);
          cursor: pointer;
        }
        
        .setting-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        .no-data-placeholder {
          text-align: center;
          padding: 50px;
          color: #aaa;
          font-size: 18px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 8px 8px;
          background-color: #fff;
        }

        .add-form-container {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 8px;
        }

        .add-form-container input {
            flex-grow: 1;
            padding: 8px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }

        .add-form-container button {
            padding: 8px 15px;
            border-radius: 5px;
            border: none;
            background-color: #27ae60;
            color: #fff;
            cursor: pointer;
        }

      `}</style>
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
