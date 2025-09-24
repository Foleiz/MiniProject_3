import React, { useState, useEffect } from "react";
import "../css/ManageEmpAndUser.css";

const API_BASE_URL = "http://localhost:3000";

/* ==================== SearchBar Component ==================== */
const SearchBar = ({ searchTerm, onSearchChange, onAddClick, addButtonText }) => (
    <div className="search-bar-container">
        <input
            type="text"
            placeholder="ค้นหา (ชื่อ, นามสกุล, username, ตำแหน่ง, แผนก)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
        />
        <div className="tab-header-actions">
            <button className="btn-add" onClick={onAddClick}>
                {addButtonText}
            </button>
        </div>
    </div>
);

/* ==================== AddEmployeeModal ==================== */
// ... (AddEmployeeModal component remains unchanged)
const AddEmployeeModal = ({ isOpen, onClose, onSubmit, positions, departments }) => {
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};
        if (!form.FIRSTNAME?.trim()) newErrors.FIRSTNAME = "กรุณากรอกชื่อ";
        if (!form.LASTNAME?.trim()) newErrors.LASTNAME = "กรุณากรอกนามสกุล";
        if (!/^\d{10}$/.test(form.EMP_TEL || "")) newErrors.EMP_TEL = "กรุณากรอกเบอร์โทร 10 หลัก";
        if (!form.POSITIONID) newErrors.POSITIONID = "กรุณาเลือกตำแหน่ง";
        if (!form.DEPARTMENTID) newErrors.DEPARTMENTID = "กรุณาเลือกแผนก";
        if (!form.USERNAME?.trim()) newErrors.USERNAME = "กรุณากรอก Username";
        if (!form.PASSWORD?.trim()) newErrors.PASSWORD = "กรุณากรอก Password";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit(form);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header"><h3>เพิ่มพนักงาน</h3></div>
                <div className="modal-body">
                    <div className="form-group"><label>ชื่อ*</label><input name="FIRSTNAME" onChange={handleChange} />{errors.FIRSTNAME && <span className="error">{errors.FIRSTNAME}</span>}</div>
                    <div className="form-group"><label>นามสกุล*</label><input name="LASTNAME" onChange={handleChange} />{errors.LASTNAME && <span className="error">{errors.LASTNAME}</span>}</div>
                    <div className="form-group"><label>เบอร์โทร*</label><input name="EMP_TEL" maxLength="10" onChange={handleChange} />{errors.EMP_TEL && <span className="error">{errors.EMP_TEL}</span>}</div>
                    <div className="form-group"><label>ตำแหน่ง*</label>
                        <select name="POSITIONID" onChange={handleChange}><option value="">กรุณาเลือก</option>{positions.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                        {errors.POSITIONID && <span className="error">{errors.POSITIONID}</span>}
                    </div>
                    <div className="form-group"><label>แผนก*</label>
                        <select name="DEPARTMENTID" onChange={handleChange}><option value="">กรุณาเลือก</option>{departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}</select>
                        {errors.DEPARTMENTID && <span className="error">{errors.DEPARTMENTID}</span>}
                    </div>
                    <div className="form-group"><label>Username*</label><input name="USERNAME" onChange={handleChange} />{errors.USERNAME && <span className="error">{errors.USERNAME}</span>}</div>
                    <div className="form-group"><label>Password*</label><input type="password" name="PASSWORD" onChange={handleChange} />{errors.PASSWORD && <span className="error">{errors.PASSWORD}</span>}</div>
                </div>
                <div className="modal-footer"><button className="btn-cancel" onClick={onClose}>ยกเลิก</button><button className="btn-submit" onClick={handleSubmit}>ยืนยัน</button></div>
            </div>
        </div>
    );
};
/* ==================== EditEmployeeModal ==================== */
// ... (EditEmployeeModal component remains unchanged)
const EditEmployeeModal = ({ isOpen, onClose, onSubmit, positions, departments, employee }) => {
    const [form, setForm] = useState(employee || {});
    const [errors, setErrors] = useState({});
    useEffect(() => { setForm(employee || {}); }, [employee]);
    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};
        if (!form.FIRSTNAME?.trim()) newErrors.FIRSTNAME = "กรุณากรอกชื่อ";
        if (!form.LASTNAME?.trim()) newErrors.LASTNAME = "กรุณากรอกนามสกุล";
        if (!/^\d{10}$/.test(form.EMP_TEL || "")) newErrors.EMP_TEL = "กรุณากรอกเบอร์โทร 10 หลัก";
        if (!form.POSITIONID) newErrors.POSITIONID = "กรุณาเลือกตำแหน่ง";
        if (!form.DEPARTMENTID) newErrors.DEPARTMENTID = "กรุณาเลือกแผนก";
        if (!form.USERNAME?.trim()) newErrors.USERNAME = "กรุณากรอก Username";
        if (!form.PASSWORD?.trim()) newErrors.PASSWORD = "กรุณากรอก Password";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = () => { if (!validate()) return; onSubmit(form); };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header"><h3>แก้ไขพนักงาน</h3></div>
                <div className="modal-body">
                    <div className="form-group"><label>ชื่อ*</label><input name="FIRSTNAME" value={form.FIRSTNAME || ""} onChange={handleChange} />{errors.FIRSTNAME && <span className="error">{errors.FIRSTNAME}</span>}</div>
                    <div className="form-group"><label>นามสกุล*</label><input name="LASTNAME" value={form.LASTNAME || ""} onChange={handleChange} />{errors.LASTNAME && <span className="error">{errors.LASTNAME}</span>}</div>
                    <div className="form-group"><label>เบอร์โทร*</label><input name="EMP_TEL" maxLength="10" value={form.EMP_TEL || ""} onChange={handleChange} />{errors.EMP_TEL && <span className="error">{errors.EMP_TEL}</span>}</div>
                    <div className="form-group"><label>ตำแหน่ง*</label>
                        <select name="POSITIONID" value={form.POSITIONID || ""} onChange={handleChange}><option value="">กรุณาเลือก</option>{positions.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                        {errors.POSITIONID && <span className="error">{errors.POSITIONID}</span>}
                    </div>
                    <div className="form-group"><label>แผนก*</label>
                        <select name="DEPARTMENTID" value={form.DEPARTMENTID || ""} onChange={handleChange}><option value="">กรุณาเลือก</option>{departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}</select>
                        {errors.DEPARTMENTID && <span className="error">{errors.DEPARTMENTID}</span>}
                    </div>
                    <div className="form-group"><label>Username*</label><input name="USERNAME" value={form.USERNAME || ""} onChange={handleChange} />{errors.USERNAME && <span className="error">{errors.USERNAME}</span>}</div>
                    <div className="form-group"><label>Password*</label><input type="password" name="PASSWORD" value={form.PASSWORD || ""} onChange={handleChange} />{errors.PASSWORD && <span className="error">{errors.PASSWORD}</span>}</div>
                </div>
                <div className="modal-footer"><button className="btn-cancel" onClick={onClose}>ยกเลิก</button><button className="btn-submit" onClick={handleSubmit}>บันทึก</button></div>
            </div>
        </div>
    );
};

/* ==================== ManageEmployees Page ==================== */
export default function ManageEmployees() {
    const [employees, setEmployees] = useState([]);
    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editing, setEditing] = useState(null);
    // 1. ADD SEARCH STATE HERE
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        const e = await fetch(`${API_BASE_URL}/employees`).then(r => r.json());
        const p = await fetch(`${API_BASE_URL}/positions`).then(r => r.json());
        const d = await fetch(`${API_BASE_URL}/departments`).then(r => r.json());
        setEmployees(e);
        setPositions(p);
        setDepartments(d);
    };
    useEffect(() => { loadData(); }, []);

    // 2. ADD FILTERING LOGIC HERE
    const filteredEmployees = employees.filter(e =>
        e.FIRSTNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.LASTNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.USERNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.POSITIONNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.DEPTNAME?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async (data) => {
        const payload = {
            firstname: data.FIRSTNAME,
            lastname: data.LASTNAME,
            emp_tel: data.EMP_TEL,
            positionid: data.POSITIONID,
            departmentid: data.DEPARTMENTID,
            username: data.USERNAME,
            password: data.PASSWORD,
        };

        await fetch(`${API_BASE_URL}/employees/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        setShowAdd(false);
        await loadData();
    };

    const handleEdit = async (emp) => {
        const payload = {
            EMPLOYEEID: emp.EMPLOYEEID,
            firstname: emp.FIRSTNAME,
            lastname: emp.LASTNAME,
            emp_tel: emp.EMP_TEL,
            positionid: emp.POSITIONID,
            departmentid: emp.DEPARTMENTID,
            username: emp.USERNAME,
            password: emp.PASSWORD,
        };

        await fetch(`${API_BASE_URL}/employees/db/${emp.EMPLOYEEID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        setShowEdit(false);
        setEditing(null);
        await loadData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบพนักงานนี้?")) return;

        await fetch(`${API_BASE_URL}/employees/db/${id}`, { method: "DELETE" });
        await loadData();
    };

    return (
        <div className="manage-roles-container">
            {/* 3. REPLACE tab-header with the new structure */}
            <div className="tab-header"><h2>ข้อมูลพนักงาน</h2></div>
            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={() => setShowAdd(true)}
                addButtonText="เพิ่มพนักงาน"
            />
            
            <div className="roles-table">
                <table>
                    <thead><tr><th>ลำดับ</th><th>ชื่อ</th><th>นามสกุล</th><th>เบอร์โทร</th><th>ตำแหน่ง</th><th>แผนก</th><th>Username</th><th>Password</th><th>ตัวเลือก</th></tr></thead>
                    <tbody>
                        {/* 4. USE filteredEmployees INSTEAD OF employees */}
                        {filteredEmployees.map((e, idx) => (
                            <tr key={e.EMPLOYEEID}>
                                <td>{idx + 1}</td><td>{e.FIRSTNAME}</td><td>{e.LASTNAME}</td><td>{e.EMP_TEL}</td><td>{e.POSITIONNAME}</td><td>{e.DEPTNAME}</td><td>{e.USERNAME}</td><td>{e.PASSWORD}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => { setEditing(e); setShowEdit(true); }}>แก้ไข</button>
                                    <button className="btn-delete" onClick={() => handleDelete(e.EMPLOYEEID)}>ลบ</button>
                                </td>
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr><td colSpan="9" style={{ textAlign: 'center' }}>ไม่พบข้อมูลพนักงานที่ตรงกับคำค้นหา</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AddEmployeeModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} positions={positions} departments={departments} />
            <EditEmployeeModal isOpen={showEdit} onClose={() => setShowEdit(false)} onSubmit={handleEdit} positions={positions} departments={departments} employee={editing} />
        </div>
    );
}