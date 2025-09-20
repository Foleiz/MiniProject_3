import React, { useState, useEffect } from "react";
import "../css/ManageRoles.css";

// Backend URL - แก้ไขตามที่ server รัน
const API_BASE_URL = "http://localhost:3000";

// Modal Component for Add New Role
const AddRoleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    positionType: "",
    departmentType: "",
    customPosition: "",
    customDepartment: "",
  });

  // ดึงข้อมูลตำแหน่งและแผนกจาก database
  const [positionOptions, setPositionOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPositions();
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/positions/formatted`);
      if (response.ok) {
        const positions = await response.json();
        setPositionOptions(positions.map((pos) => pos.name));
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/formatted`);
      if (response.ok) {
        const departments = await response.json();
        setDepartmentOptions(departments.map((dept) => dept.name));
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSubmit = () => {
    const position = formData.customPosition || formData.positionType;
    const department = formData.customDepartment || formData.departmentType;

    if (position && department) {
      onSubmit({ position, department });
      setFormData({
        positionType: "",
        departmentType: "",
        customPosition: "",
        customDepartment: "",
      });
    } else {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>เพิ่มข้อมูลใหม่</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>ตำแหน่ง</label>
            <div className="select-container">
              <select
                value={formData.positionType}
                onChange={(e) =>
                  setFormData({ ...formData, positionType: e.target.value })
                }
              >
                <option value="">กรุณาเลือกตำแหน่ง</option>
                {positionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="custom-options">
              {positionOptions.map((option) => (
                <div key={option} className="option-item">
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>แผนก</label>
            <div className="select-container">
              <select
                value={formData.departmentType}
                onChange={(e) =>
                  setFormData({ ...formData, departmentType: e.target.value })
                }
              >
                <option value="">กรุณาเลือกแผนก</option>
                {departmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="custom-options">
              {departmentOptions.map((option) => (
                <div key={option} className="option-item">
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Add Position
const AddPositionModal = ({ isOpen, onClose, onSubmit }) => {
  const [positionName, setPositionName] = useState("");

  const handleSubmit = () => {
    if (positionName.trim()) {
      onSubmit(positionName.trim());
      setPositionName("");
    } else {
      alert("กรุณากรอกชื่อตำแหน่ง");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>เพิ่มข้อมูลใหม่</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>ตำแหน่ง</label>
            <div className="input-container">
              <input
                type="text"
                placeholder="กรุณากรอกตำแหน่ง"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
              />
              <span className="input-icon">✏️</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Add Department
const AddDepartmentModal = ({ isOpen, onClose, onSubmit }) => {
  const [departmentName, setDepartmentName] = useState("");

  const handleSubmit = () => {
    if (departmentName.trim()) {
      onSubmit(departmentName.trim());
      setDepartmentName("");
    } else {
      alert("กรุณากรอกชื่อแผนก");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>เพิ่มข้อมูลใหม่</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>แผนก</label>
            <div className="input-container">
              <input
                type="text"
                placeholder="กรุณากรอกแผนก"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
              <span className="input-icon">✏️</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for the "เมนูหลัก" (Main Menu) tab - Permissions Matrix
const MainMenuTab = ({
  roles,
  onRoleDelete,
  onPermissionToggle,
  onSave,
  onAdd,
}) => {
  const permissions = [
    "การจัดการสิทธิ์",
    "การกำหนดบทบาท",
    "การจัดการเส้นทาง",
    "การจัดตารางคนขับ",
    "ข้อมูลรถ",
    "ประเภทรถ",
    "ดูรายงาน",
  ];

  return (
    <div className="content-tab">
      <div className="tab-header">
        <div className="header-left">
          <span className="home-icon"></span>
          <span className="tab-title"></span>
        </div>
        <div className="header-right">
          <button className="btn-save" onClick={onSave}>
            บันทึก
          </button>
          <button className="btn-add" onClick={onAdd}>
            เพิ่ม
          </button>
        </div>
      </div>

      <div className="roles-table">
        <table className="permissions-table">
          <thead>
            <tr>
              <td className="permissions-header">หัวข้อ</td>
              {roles.map((role) => (
                <td key={role.id} className="role-column">
                  <div className="role-header">
                    <div className="role-info">
                      <div className="role-name">{role.name}</div>
                      <div className="role-description">{role.description}</div>
                    </div>
                    <button
                      className="delete-role-btn"
                      onClick={() => onRoleDelete(role.id)}
                      title="ลบบทบาท"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              ))}
              <td className="no-data-column">
                <div className="no-data-text">
                  {roles.length === 0 ? "ไม่มีข้อมูลบทบาท" : "ไม่มีข้อมูล"}
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission}>
                <td className="permission-name">{permission}</td>
                {roles.map((role) => (
                  <td
                    key={`${role.id}-${permission}`}
                    className="permission-cell"
                  >
                    <input
                      type="checkbox"
                      className="permission-checkbox"
                      checked={role.permissions?.[permission] || false}
                      onChange={(e) =>
                        onPermissionToggle(
                          role.id,
                          permission,
                          e.target.checked
                        )
                      }
                    />
                  </td>
                ))}
                <td className="empty-cell"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component for the "ตำแหน่ง" (Position) tab
const PositionTab = () => {
  const [positions, setPositions] = useState([]); // เริ่มต้นเป็น array ว่าง
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPositions, setSelectedPositions] = useState([]);

  // Fetch positions from backend
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/positions/formatted`);
      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      alert("ไม่สามารถดึงข้อมูลตำแหน่งได้ กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  // Load positions on component mount
  useEffect(() => {
    fetchPositions();
  }, []);

  const filteredPositions = positions.filter(
    (pos) =>
      pos.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPosition = async (positionName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/positions/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position_name: positionName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add position");
      }

      setShowAddModal(false);
      alert("เพิ่มตำแหน่งใหม่เรียบร้อยแล้ว!");
      fetchPositions(); // Refresh data
    } catch (error) {
      console.error("Error adding position:", error);
      alert("ไม่สามารถเพิ่มตำแหน่งได้ กรุณาลองใหม่");
    }
  };

  const handleCheckboxChange = (positionDbId, isChecked) => {
    if (isChecked) {
      setSelectedPositions([...selectedPositions, positionDbId]);
    } else {
      setSelectedPositions(
        selectedPositions.filter((id) => id !== positionDbId)
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPositions.length === 0) {
      alert("กรุณาเลือกรายการที่ต้องการลบ");
      return;
    }

    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบรายการที่เลือก ${selectedPositions.length} รายการ?`
      )
    ) {
      return;
    }

    try {
      const deletePromises = selectedPositions.map((dbId) =>
        fetch(`${API_BASE_URL}/positions/db/${dbId}`, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter((response) => !response.ok);

      if (failedDeletes.length > 0) {
        alert(`มีข้อผิดพลาดในการลบบางรายการ`);
      } else {
        alert("ลบรายการเรียบร้อยแล้ว");
      }

      setSelectedPositions([]);
      fetchPositions(); // Refresh data
    } catch (error) {
      console.error("Error deleting positions:", error);
      alert("ไม่สามารถลบรายการได้ กรุณาลองใหม่");
    }
  };

  const handleMasterCheckbox = (isChecked) => {
    if (isChecked) {
      setSelectedPositions(filteredPositions.map((pos) => pos.dbId));
    } else {
      setSelectedPositions([]);
    }
  };

  if (loading) {
    return (
      <div className="position-tab">
        <div style={{ textAlign: "center", padding: "20px" }}>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="position-tab">
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาตามชื่อตำแหน่ง"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="action-buttons-row">
          <button className="btn-delete" onClick={handleDeleteSelected}>
            ลบ ({selectedPositions.length})
          </button>
          <button
            className="btn-add-item"
            onClick={() => setShowAddModal(true)}
          >
            เพิ่ม
          </button>
        </div>
      </div>

      <div className="position-table-container">
        <div className="table-header">
          <div className="checkbox-col">
            <input
              type="checkbox"
              onChange={(e) => handleMasterCheckbox(e.target.checked)}
              checked={
                selectedPositions.length === filteredPositions.length &&
                filteredPositions.length > 0
              }
            />
          </div>
          <div className="id-col">รหัสตำแหน่ง</div>
          <div className="name-col">ชื่อตำแหน่ง</div>
          <div className="action-col"></div>
        </div>

        {filteredPositions.length === 0 ? (
          <div className="table-row">
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                gridColumn: "1 / -1",
              }}
            >
              {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลตำแหน่ง"}
            </div>
          </div>
        ) : (
          filteredPositions.map((position) => (
            <div key={position.id} className="table-row">
              <div className="checkbox-col">
                <input
                  type="checkbox"
                  className="row-checkbox"
                  checked={selectedPositions.includes(position.dbId)}
                  onChange={(e) =>
                    handleCheckboxChange(position.dbId, e.target.checked)
                  }
                />
              </div>
              <div className="id-col">{position.id}</div>
              <div className="name-col">{position.name}</div>
              <div className="action-col">
                <button className="setting-btn">⚙️</button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddPositionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPosition}
      />
    </div>
  );
};

// Component for the "แผนก" (Department) tab
const DepartmentTab = () => {
  const [departments, setDepartments] = useState([]); // เริ่มต้นเป็น array ว่าง
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // Fetch departments from backend
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/departments/formatted`);
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("ไม่สามารถดึงข้อมูลแผนกได้ กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  // Load departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = async (departmentName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department_name: departmentName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add department");
      }

      setShowAddModal(false);
      alert("เพิ่มแผนกใหม่เรียบร้อยแล้ว!");
      fetchDepartments(); // Refresh data
    } catch (error) {
      console.error("Error adding department:", error);
      alert("ไม่สามารถเพิ่มแผนกได้ กรุณาลองใหม่");
    }
  };

  const handleCheckboxChange = (departmentDbId, isChecked) => {
    if (isChecked) {
      setSelectedDepartments([...selectedDepartments, departmentDbId]);
    } else {
      setSelectedDepartments(
        selectedDepartments.filter((id) => id !== departmentDbId)
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDepartments.length === 0) {
      alert("กรุณาเลือกรายการที่ต้องการลบ");
      return;
    }

    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบรายการที่เลือก ${selectedDepartments.length} รายการ?`
      )
    ) {
      return;
    }

    try {
      const deletePromises = selectedDepartments.map((dbId) =>
        fetch(`${API_BASE_URL}/departments/db/${dbId}`, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter((response) => !response.ok);

      if (failedDeletes.length > 0) {
        alert(`มีข้อผิดพลาดในการลบบางรายการ`);
      } else {
        alert("ลบรายการเรียบร้อยแล้ว");
      }

      setSelectedDepartments([]);
      fetchDepartments(); // Refresh data
    } catch (error) {
      console.error("Error deleting departments:", error);
      alert("ไม่สามารถลบรายการได้ กรุณาลองใหม่");
    }
  };

  const handleMasterCheckbox = (isChecked) => {
    if (isChecked) {
      setSelectedDepartments(filteredDepartments.map((dept) => dept.dbId));
    } else {
      setSelectedDepartments([]);
    }
  };

  if (loading) {
    return (
      <div className="department-tab">
        <div style={{ textAlign: "center", padding: "20px" }}>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="department-tab">
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาตามชื่อแผนก"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="action-buttons-row">
          <button className="btn-delete" onClick={handleDeleteSelected}>
            ลบ ({selectedDepartments.length})
          </button>
          <button
            className="btn-add-item"
            onClick={() => setShowAddModal(true)}
          >
            เพิ่ม
          </button>
        </div>
      </div>

      <div className="department-table-container">
        <div className="table-header orange-header">
          <div className="checkbox-col">
            <input
              type="checkbox"
              onChange={(e) => handleMasterCheckbox(e.target.checked)}
              checked={
                selectedDepartments.length === filteredDepartments.length &&
                filteredDepartments.length > 0
              }
            />
          </div>
          <div className="id-col">รหัสแผนก</div>
          <div className="name-col">ชื่อแผนก</div>
          <div className="action-col"></div>
        </div>

        {filteredDepartments.length === 0 ? (
          <div className="table-row">
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                gridColumn: "1 / -1",
              }}
            >
              {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลแผนก"}
            </div>
          </div>
        ) : (
          filteredDepartments.map((department) => (
            <div key={department.id} className="table-row">
              <div className="checkbox-col">
                <input
                  type="checkbox"
                  className="row-checkbox"
                  checked={selectedDepartments.includes(department.dbId)}
                  onChange={(e) =>
                    handleCheckboxChange(department.dbId, e.target.checked)
                  }
                />
              </div>
              <div className="id-col">{department.id}</div>
              <div className="name-col">{department.name}</div>
              <div className="action-col">
                <button className="setting-btn">⚙️</button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddDepartmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDepartment}
      />
    </div>
  );
};

// Main ManageRoles Component
export default function ManageRoles() {
  const [activeTab, setActiveTab] = useState("main");
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [roles, setRoles] = useState([]); // เริ่มต้นเป็น array ว่าง

  const handleRoleDelete = (roleId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบบทบาทนี้?")) {
      setRoles(roles.filter((role) => role.id !== roleId));
      alert("ลบบทบาทเรียบร้อยแล้ว");
    }
  };

  const handlePermissionToggle = (roleId, permission, checked) => {
    setRoles(
      roles.map((role) => {
        if (role.id === roleId) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permission]: checked,
            },
          };
        }
        return role;
      })
    );
  };

  const handleSave = () => {
    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
  };

  const handleAdd = () => {
    setShowAddRoleModal(true);
  };

  const handleAddRole = ({ position, department }) => {
    const newRole = {
      id: `role_${Date.now()}`,
      name: position,
      description: department,
      permissions: {
        การจัดการสิทธิ์: false,
        การกำหนดบทบาท: false,
        การจัดการเส้นทาง: false,
        การจัดตารางคนขับ: false,
        ข้อมูลรถ: false,
        ประเภทรถ: false,
        ดูรายงาน: false,
      },
    };
    setRoles([...roles, newRole]);
    setShowAddRoleModal(false);
    alert("เพิ่มบทบาทใหม่เรียบร้อยแล้ว!");
  };

  return (
    <div className="manage-roles-container">
      <div className="header-section">
        <div className="search-bar-container">
          {/* <input
            type="text"
            placeholder="ค้นหาตามชื่อ,แผนก"
            className="main-search-input"
          /> */}
        </div>
        <div className="user-info">
          <span className="settings-icon">⚙️</span>
          <span className="notification-icon">🔔</span>
          <div className="profile">
            <span className="profile-icon">👤</span>
            <div className="profile-text">
              <span className="profile-name">Admin02</span>
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
          🏠 เมนูหลัก
        </button>
        <button
          className={
            activeTab === "position" ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab("position")}
        >
          ตำแหน่ง
        </button>
        <button
          className={
            activeTab === "department" ? "tab-button active" : "tab-button"
          }
          onClick={() => setActiveTab("department")}
        >
          แผนก
        </button>
      </div>

      <div className="content-display">
        {activeTab === "main" && (
          <MainMenuTab
            roles={roles}
            onRoleDelete={handleRoleDelete}
            onPermissionToggle={handlePermissionToggle}
            onSave={handleSave}
            onAdd={handleAdd}
          />
        )}
        {activeTab === "position" && <PositionTab />}
        {activeTab === "department" && <DepartmentTab />}
      </div>

      <AddRoleModal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        onSubmit={handleAddRole}
      />
    </div>
  );
}
