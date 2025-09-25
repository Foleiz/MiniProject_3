import React, { useState, useEffect } from "react";
import "../css/ManageEmpAndUser.css";

const API_BASE_URL = "http://localhost:3000";

/* ==================== SearchBar Component ==================== */
// Defined the reusable SearchBar component here
const SearchBar = ({
  searchTerm,
  onSearchChange,
  onAddClick,
  addButtonText,
}) => (
  <div className="empuser-search-bar-container">
    <input
      type="text"
      // Search criteria updated for Users
      placeholder="ค้นหา (ชื่อ, นามสกุล, username, สถานะ)..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="empuser-search-input"
    />
    <div className="empuser-tab-header-actions">
      <button className="empuser-btn-add" onClick={onAddClick}>
        {addButtonText}
      </button>
    </div>
  </div>
);
// ---
// The AddUserModal and EditUserModal components remain unchanged
// ---

/* ==================== AddUserModal ==================== */
const AddUserModal = ({ isOpen, onClose, onSubmit, statuses }) => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  if (!isOpen) return null;

  const validate = () => {
    let newErrors = {};
    if (!form.FIRSTNAME?.trim()) newErrors.FIRSTNAME = "กรุณากรอกชื่อ";
    if (!form.LASTNAME?.trim()) newErrors.LASTNAME = "กรุณากรอกนามสกุล";
    if (!/^\d{10}$/.test(form.USER_TEL || ""))
      newErrors.USER_TEL = "กรุณากรอกเบอร์โทร 10 หลัก";
    if (!form.STATUSID) newErrors.STATUSID = "กรุณาเลือกสถานะ";
    if (!form.USERNAME?.trim()) newErrors.USERNAME = "กรุณากรอก Username";
    if (!form.PASSWORD?.trim()) newErrors.PASSWORD = "กรุณากรอก Password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="empuser-modal-overlay">
      <div className="empuser-modal-content">
        <div className="empuser-modal-header">
          <h3>เพิ่มผู้ใช้</h3>
        </div>
        <div className="empuser-modal-body">
          <div className="empuser-form-group">
            <label>ชื่อ*</label>
            <input name="FIRSTNAME" onChange={handleChange} />
            {errors.FIRSTNAME && (
              <span className="empuser-error">{errors.FIRSTNAME}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>นามสกุล*</label>
            <input name="LASTNAME" onChange={handleChange} />
            {errors.LASTNAME && (
              <span className="empuser-error">{errors.LASTNAME}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>เบอร์โทร*</label>
            <input name="USER_TEL" maxLength="10" onChange={handleChange} />
            {errors.USER_TEL && (
              <span className="empuser-error">{errors.USER_TEL}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>สถานะ*</label>
            <select name="STATUSID" onChange={handleChange}>
              <option value="">กรุณาเลือก</option>
              {statuses.map((s) => (
                <option key={s.STATUSID} value={s.STATUSID}>
                  {s.STATUSNAME}
                </option>
              ))}
            </select>
            {errors.STATUSID && (
              <span className="empuser-error">{errors.STATUSID}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>Username*</label>
            <input name="USERNAME" onChange={handleChange} />
            {errors.USERNAME && (
              <span className="empuser-error">{errors.USERNAME}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>Password*</label>
            <input type="password" name="PASSWORD" onChange={handleChange} />
            {errors.PASSWORD && (
              <span className="empuser-error">{errors.PASSWORD}</span>
            )}
          </div>
        </div>
        <div className="empuser-modal-footer">
          <button className="empuser-btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="empuser-btn-submit" onClick={handleSubmit}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================== EditUserModal ==================== */
const EditUserModal = ({ isOpen, onClose, onSubmit, statuses, user }) => {
  const [form, setForm] = useState(user || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(user || {});
  }, [user]);

  if (!isOpen) return null;

  const validate = () => {
    let newErrors = {};
    if (!form.FIRSTNAME?.trim()) newErrors.FIRSTNAME = "กรุณากรอกชื่อ";
    if (!form.LASTNAME?.trim()) newErrors.LASTNAME = "กรุณากรอกนามสกุล";
    if (!/^\d{10}$/.test(form.USER_TEL || ""))
      newErrors.USER_TEL = "กรุณากรอกเบอร์โทร 10 หลัก";
    if (!form.STATUSID) newErrors.STATUSID = "กรุณาเลือกสถานะ";
    if (!form.USERNAME?.trim()) newErrors.USERNAME = "กรุณากรอก Username";
    if (!form.PASSWORD?.trim()) newErrors.PASSWORD = "กรุณากรอก Password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="empuser-modal-overlay">
      <div className="empuser-modal-content">
        <div className="empuser-modal-header">
          <h3>แก้ไขผู้ใช้</h3>
        </div>
        <div className="empuser-modal-body">
          <div className="empuser-form-group">
            <label>ชื่อ*</label>
            <input
              name="FIRSTNAME"
              value={form.FIRSTNAME || ""}
              onChange={handleChange}
            />
            {errors.FIRSTNAME && (
              <span className="empuser-error">{errors.FIRSTNAME}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>นามสกุล*</label>
            <input
              name="LASTNAME"
              value={form.LASTNAME || ""}
              onChange={handleChange}
            />
            {errors.LASTNAME && (
              <span className="empuser-error">{errors.LASTNAME}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>เบอร์โทร*</label>
            <input
              name="USER_TEL"
              maxLength="10"
              value={form.USER_TEL || ""}
              onChange={handleChange}
            />
            {errors.USER_TEL && (
              <span className="empuser-error">{errors.USER_TEL}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>สถานะ*</label>
            <select
              name="STATUSID"
              value={form.STATUSID || ""}
              onChange={handleChange}
            >
              <option value="">กรุณาเลือก</option>
              {statuses.map((s) => (
                <option key={s.STATUSID} value={s.STATUSID}>
                  {s.STATUSNAME}
                </option>
              ))}
            </select>
            {errors.STATUSID && (
              <span className="empuser-error">{errors.STATUSID}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>Username*</label>
            <input
              name="USERNAME"
              value={form.USERNAME || ""}
              onChange={handleChange}
            />
            {errors.USERNAME && (
              <span className="empuser-error">{errors.USERNAME}</span>
            )}
          </div>
          <div className="empuser-form-group">
            <label>Password*</label>
            <input
              type="password"
              name="PASSWORD"
              value={form.PASSWORD || ""}
              onChange={handleChange}
            />
            {errors.PASSWORD && (
              <span className="empuser-error">{errors.PASSWORD}</span>
            )}
          </div>
        </div>
        <div className="empuser-modal-footer">
          <button className="empuser-btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="empuser-btn-submit" onClick={handleSubmit}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================== ManageUsers Page (Updated) ==================== */
export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  // 1. ADD SEARCH STATE
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    const u = await fetch(`${API_BASE_URL}/users`).then((r) => r.json());
    const s = await fetch(`${API_BASE_URL}/user_status`).then((r) => r.json());
    setUsers(u);
    setStatuses(s);
  };
  useEffect(() => {
    loadData();
  }, []);

  // 2. ADD FILTERING LOGIC
  const filteredUsers = users.filter(
    (u) =>
      u.FIRSTNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.LASTNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.USERNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.STATUSNAME?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (data) => {
    const payload = {
      firstname: data.FIRSTNAME,
      lastname: data.LASTNAME,
      user_tel: data.USER_TEL,
      // Ensure the statusid is correctly mapped and parsed if needed (though `data.STATUSID` should be a string number here)
      statusid: data.STATUSID,
      username: data.USERNAME,
      password: data.PASSWORD,
    };

    await fetch(`${API_BASE_URL}/users/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowAdd(false);
    await loadData();
  };

  const handleEdit = async (data) => {
    const payload = {
      firstname: data.FIRSTNAME,
      lastname: data.LASTNAME,
      user_tel: data.USER_TEL,
      statusid: data.STATUSID,
      username: data.USERNAME,
      password: data.PASSWORD,
    };

    await fetch(`${API_BASE_URL}/users/db/${data.USERID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowEdit(false);
    setEditing(null);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) return;
    await fetch(`${API_BASE_URL}/users/db/${id}`, { method: "DELETE" });
    await loadData();
  };

  return (
    <div className="empuser-container">
      {/* 3. REPLACE tab-header with the new structure */}
      <div className="empuser-tab-header">
        <h2>ข้อมูลผู้ใช้</h2>
      </div>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setShowAdd(true)}
        addButtonText="เพิ่มผู้ใช้"
      />

      <div className="empuser-table-container">
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อ</th>
              <th>นามสกุล</th>
              <th>เบอร์โทร</th>
              <th>สถานะ</th>
              <th>Username</th>
              <th>Password</th>
              <th>ตัวเลือก</th>
            </tr>
          </thead>
          <tbody>
            {/* 4. USE filteredUsers INSTEAD OF users */}
            {filteredUsers.map((u, idx) => (
              <tr key={u.USERID}>
                <td>{idx + 1}</td>
                <td>{u.FIRSTNAME}</td>
                <td>{u.LASTNAME}</td>
                <td>{u.USER_TEL}</td>
                <td>{u.STATUSNAME}</td>
                <td>{u.USERNAME}</td>
                <td>{u.PASSWORD}</td>
                <td>
                  <button
                    className="empuser-btn-edit"
                    onClick={() => {
                      setEditing(u);
                      setShowEdit(true);
                    }}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="empuser-btn-delete"
                    onClick={() => handleDelete(u.USERID)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {/* Add a message if no results are found */}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  ไม่พบข้อมูลผู้ใช้ที่ตรงกับคำค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddUserModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
        statuses={statuses}
      />
      <EditUserModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={handleEdit}
        statuses={statuses}
        user={editing}
      />
    </div>
  );
}
