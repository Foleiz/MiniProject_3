import React, { useState, useEffect } from "react";
import "../css/ManageRoles.css";

const API_BASE_URL = "http://localhost:3000";

/* =============== Utils =============== */
const safe = (v) => (v ?? "").toString();
const normalize = (data, prefix, keys) => {
  if (!Array.isArray(data)) return [];
  if (data.length && Array.isArray(data[0])) {
    // rows array: [[id,name], ...]
    return data.map((r) => ({
      dbId: r[0],
      name: r[1],
      id: `${prefix}${String(r[0]).padStart(3, "0")}`,
    }));
  }
  // array of objects (fallback to many possible keys)
  return data.map((r) => {
    const dbId = r.dbId ?? r[keys.idLower] ?? r[keys.idUpper];
    const name = r.name ?? r[keys.nameLower] ?? r[keys.nameUpper];
    const id =
      r.id ??
      r.formatted_id ??
      (dbId != null ? `${prefix}${String(dbId).padStart(3, "0")}` : "");
    return { dbId, name, id };
  });
};

/* =============== Generic Modals =============== */
const AddItemModal = ({ isOpen, title, label, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  useEffect(() => {
    if (!isOpen) setName("");
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>{label}</label>
            <div className="input-container">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`กรุณากรอก${label}`}
              />
              <span className="input-icon">✏️</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit"
            onClick={() =>
              name.trim() ? onSubmit(name.trim()) : alert(`กรุณากรอก${label}`)
            }
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

const EditItemModal = ({ isOpen, title, label, item, onClose, onSubmit }) => {
  const [name, setName] = useState(item?.name ?? "");
  useEffect(() => {
    setName(item?.name ?? "");
  }, [item]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>รหัส</label>
            <input value={item?.id ?? ""} readOnly disabled />
          </div>
          <div className="form-group">
            <label>{label}</label>
            <div className="input-container">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`กรุณากรอก${label}`}
              />
              <span className="input-icon">✏️</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit"
            onClick={() =>
              name.trim()
                ? onSubmit(item.dbId, name.trim())
                : alert(`กรุณากรอก${label}`)
            }
          >
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
};

/* =============== Generic CRUD Hook =============== */
function useCrudList(config) {
  const { path, prefix, keys } = config;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const list = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE_URL}/${path}`);
      if (!r.ok) throw new Error("fetch failed");
      const raw = await r.json();
      setItems(normalize(raw, prefix, keys));
    } finally {
      setLoading(false);
    }
  };

  const add = async (name) => {
    const body = { [keys.postNameKey]: name };
    const r = await fetch(`${API_BASE_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error("create failed");
    await list();
  };

  const update = async (dbId, name) => {
    const r = await fetch(`${API_BASE_URL}/${path}/${dbId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [keys.postNameKey]: name }),
    });
    if (!r.ok) throw new Error("update failed");
    await list();
  };

  const removeMany = async (ids) => {
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`${API_BASE_URL}/${path}/${id}`, { method: "DELETE" })
      )
    );
    const ok = results.every((res) => res.ok);
    if (!ok) throw new Error("some deletes failed");
    await list();
  };

  useEffect(() => {
    list(); /* mount */
  }, []); // eslint-disable-line
  return { items, loading, list, add, update, removeMany, setItems };
}

/* =============== Generic Tab Component =============== */
function GenericTab({ label, config }) {
  const { items, loading, add, update, removeMany } = useCrudList(config);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const q = safe(search).toLowerCase();
  const filtered = items.filter(
    (it) =>
      safe(it.id).toLowerCase().includes(q) ||
      safe(it.name).toLowerCase().includes(q)
  );

  const toggleAll = (checked) =>
    setSelected(checked ? filtered.map((it) => it.dbId) : []);

  const toggleOne = (dbId, checked) =>
    setSelected((prev) =>
      checked ? [...prev, dbId] : prev.filter((id) => id !== dbId)
    );

  const onDelete = async () => {
    if (!selected.length) return alert("กรุณาเลือกรายการที่ต้องการลบ");
    if (!window.confirm(`ลบ ${selected.length} รายการ?`)) return;
    try {
      await removeMany(selected);
      setSelected([]);
      alert("ลบรายการเรียบร้อยแล้ว");
    } catch {
      alert("มีข้อผิดพลาดในการลบบางรายการ");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 20 }}>กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className={`${config.path}-tab`}>
      <div className="search-section">
        <div className="search-container">
          <input
            className="search-input"
            placeholder={`ค้นหาตามชื่อ${label}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="action-buttons-row">
          <button className="btn-delete" onClick={onDelete}>
            ลบ ({selected.length})
          </button>
          <button className="btn-add-item" onClick={() => setShowAdd(true)}>
            เพิ่ม
          </button>
        </div>
      </div>

      <div className={`${config.path}-table-container`}>
        <div className={`table-header ${config.headerClass || ""}`}>
          <div className="checkbox-col">
            <input
              type="checkbox"
              onChange={(e) => toggleAll(e.target.checked)}
              checked={
                selected.length === filtered.length && filtered.length > 0
              }
            />
          </div>
          <div className="id-col">{`รหัส${label}`}</div>
          <div className="name-col">{`ชื่อ${label}`}</div>
          <div className="action-col" />
        </div>

        {filtered.length === 0 ? (
          <div className="table-row">
            <div
              style={{ textAlign: "center", padding: 20, gridColumn: "1 / -1" }}
            >
              {search ? "ไม่พบข้อมูลที่ค้นหา" : `ไม่มีข้อมูล${label}`}
            </div>
          </div>
        ) : (
          filtered.map((it) => (
            <div key={it.id} className="table-row">
              <div className="checkbox-col">
                <input
                  type="checkbox"
                  className="row-checkbox"
                  checked={selected.includes(it.dbId)}
                  onChange={(e) => toggleOne(it.dbId, e.target.checked)}
                />
              </div>
              <div className="id-col">{it.id}</div>
              <div className="name-col">{it.name}</div>
              <div className="action-col">
                <button
                  className="setting-btn"
                  onClick={() => {
                    setEditing(it);
                    setShowEdit(true);
                  }}
                >
                  ⚙️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddItemModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="เพิ่มข้อมูลใหม่"
        label={label}
        onSubmit={async (name) => {
          try {
            await add(name);
            setShowAdd(false);
            alert(`เพิ่ม${label}ใหม่เรียบร้อยแล้ว!`);
          } catch {
            alert(`ไม่สามารถเพิ่ม${label}ได้ กรุณาลองใหม่`);
          }
        }}
      />

      <EditItemModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title={`แก้ไข${label}`}
        label={label}
        item={editing}
        onSubmit={async (dbId, name) => {
          try {
            await update(dbId, name);
            alert(`แก้ไขข้อมูล${label}เรียบร้อยแล้ว!`);
          } catch {
            alert(`ไม่สามารถแก้ไข${label}ได้ กรุณาลองใหม่`);
          } finally {
            setShowEdit(false);
            setEditing(null);
          }
        }}
      />
    </div>
  );
}

/* =============== Main Menu (คงเดิมแบบกระชับ) =============== */
const AddPermissionModal = ({ isOpen, onClose, onSubmit }) => {
  const [permissionName, setPermissionName] = useState("");
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>เพิ่มสิทธิ์ใหม่</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>ชื่อสิทธิ์</label>
            <div className="input-container">
              <input
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                placeholder="กรุณากรอกชื่อสิทธิ์"
              />
              <span className="input-icon">✏️</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit"
            onClick={() => {
              if (!permissionName.trim()) return alert("กรุณากรอกชื่อสิทธิ์");
              onSubmit(permissionName.trim());
              setPermissionName("");
            }}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

const AddRoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  getPositionNames,
  getDepartmentNames,
}) => {
  const [positionType, setPositionType] = useState("");
  const [departmentType, setDepartmentType] = useState("");
  if (!isOpen) return null;
  const positions = getPositionNames();
  const departments = getDepartmentNames();
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>เพิ่มบทบาท</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>ตำแหน่ง</label>
            <div className="select-container">
              <select
                value={positionType}
                onChange={(e) => setPositionType(e.target.value)}
              >
                <option value="">กรุณาเลือกตำแหน่ง</option>
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>แผนก</label>
            <div className="select-container">
              <select
                value={departmentType}
                onChange={(e) => setDepartmentType(e.target.value)}
              >
                <option value="">กรุณาเลือกแผนก</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit"
            onClick={() => {
              if (!positionType || !departmentType)
                return alert("กรุณาเลือกให้ครบ");
              onSubmit({ position: positionType, department: departmentType });
              onClose();
            }}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

const MainMenuTab = ({
  roles,
  permissions,
  onRoleDelete,
  onPermissionToggle,
  onPermissionDelete,
  onSave,
  onAdd,
  onAddPermission,
}) => (
  <div className="content-tab">
    <div className="tab-header">
      <div className="header-left">
        <span className="home-icon">🏠</span>
        <span className="tab-title">เมนูหลัก</span>
      </div>
      <div className="header-right">
        <button className="btn-save" onClick={onSave}>
          บันทึก
        </button>
        <button className="btn-add" onClick={onAdd}>
          เพิ่มบทบาท
        </button>
      </div>
    </div>
    <div className="roles-table">
      <table className="permissions-table">
        <thead>
          <tr>
            <td className="permissions-header">
              <div className="permissions-header-content">
                <span>หัวข้อ</span>
                <button
                  className="btn-add-permission"
                  onClick={onAddPermission}
                  title="เพิ่มสิทธิ์ใหม่"
                >
                  เพิ่ม
                </button>
              </div>
            </td>
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
                  >
                    ลบ
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
          {permissions.map((perm) => (
            <tr key={perm}>
              <td className="permission-name">
                <div className="permission-row">
                  <span>{perm}</span>
                  <button
                    className="delete-permission-btn"
                    onClick={() => onPermissionDelete(perm)}
                  >
                    ลบ
                  </button>
                </div>
              </td>
              {roles.map((role) => (
                <td key={`${role.id}-${perm}`} className="permission-cell">
                  <input
                    type="checkbox"
                    className="permission-checkbox"
                    checked={role.permissions?.[perm] || false}
                    onChange={(e) =>
                      onPermissionToggle(role.id, perm, e.target.checked)
                    }
                  />
                </td>
              ))}
              <td className="empty-cell" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* =============== Page =============== */
export default function ManageRoles() {
  const [activeTab, setActiveTab] = useState("main");
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddPerm, setShowAddPerm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([
    "การจัดการสิทธิ์",
    "การกำหนดบทบาท",
    "การจัดการเส้นทาง",
    "การจัดตารางคนขับ",
    "ข้อมูลรถ",
    "ประเภทรถ",
    "ดูรายงาน",
  ]);

  // สำหรับ modal เพิ่มบทบาท: ดึงชื่อจาก API จริง (reuse normalizer)
  const [posNames, setPosNames] = useState([]);
  const [depNames, setDepNames] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const pr = await fetch(`${API_BASE_URL}/positions`);
        const dr = await fetch(`${API_BASE_URL}/departments`);
        if (pr.ok)
          setPosNames(
            normalize(await pr.json(), "P", {
              idLower: "position_id",
              idUpper: "PositionID",
              nameLower: "position_name",
              nameUpper: "PositionName",
            }).map((x) => x.name)
          );
        if (dr.ok)
          setDepNames(
            normalize(await dr.json(), "D", {
              idLower: "department_id",
              idUpper: "DepartmentID",
              nameLower: "department_name",
              nameUpper: "DeptName",
            }).map((x) => x.name)
          );
      } catch (err) {
        console.error("Error fetching names:", err);
      }
    })();
  }, []);

  const getPositionNames = () => posNames;
  const getDepartmentNames = () => depNames;

  const handleRoleDelete = (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบบทบาทนี้?")) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
    alert("ลบบทบาทเรียบร้อยแล้ว");
  };

  const handlePermissionToggle = (roleId, perm, checked) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          permissions: { ...(r.permissions || {}), [perm]: checked },
        };
      })
    );
  };

  const handlePermissionDelete = (perm) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบสิทธิ์ "${perm}"?`)) return;
    setPermissions((prev) => prev.filter((p) => p !== perm));
    setRoles((prev) =>
      prev.map((r) => {
        if (r.permissions?.[perm]) {
          const cp = { ...r.permissions };
          delete cp[perm];
          return { ...r, permissions: cp };
        }
        return r;
      })
    );
    alert("ลบสิทธิ์เรียบร้อยแล้ว");
  };

  const handleAddRole = ({ position, department }) => {
    const id = `role_${Date.now()}`;
    const perms = permissions.reduce((acc, p) => ((acc[p] = false), acc), {});
    setRoles((prev) => [
      ...prev,
      { id, name: position, description: department, permissions: perms },
    ]);
    setShowAddRole(false);
    alert("เพิ่มบทบาทใหม่เรียบร้อยแล้ว!");
  };

  const positionConfig = {
    path: "positions",
    prefix: "P",
    headerClass: "", // สีหัวตาราง
    keys: {
      idLower: "position_id",
      idUpper: "PositionID",
      nameLower: "position_name",
      nameUpper: "PositionName",
      postNameKey: "position_name",
    },
  };
  const departmentConfig = {
    path: "departments",
    prefix: "D",
    headerClass: "orange-header",
    keys: {
      idLower: "department_id",
      idUpper: "DepartmentID",
      nameLower: "department_name",
      nameUpper: "DeptName",
      postNameKey: "department_name",
    },
  };

  return (
    <div className="manage-roles-container">
      <div className="header-section">
        <div className="search-bar-container" />
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
            permissions={permissions}
            onRoleDelete={handleRoleDelete}
            onPermissionToggle={handlePermissionToggle}
            onPermissionDelete={handlePermissionDelete}
            onSave={() => alert("บันทึกข้อมูลเรียบร้อยแล้ว!")}
            onAdd={() => setShowAddRole(true)}
            onAddPermission={() => setShowAddPerm(true)}
          />
        )}
        {activeTab === "position" && (
          <GenericTab title="ตำแหน่ง" label="ตำแหน่ง" config={positionConfig} />
        )}
        {activeTab === "department" && (
          <GenericTab title="แผนก" label="แผนก" config={departmentConfig} />
        )}
      </div>

      <AddRoleModal
        isOpen={showAddRole}
        onClose={() => setShowAddRole(false)}
        onSubmit={handleAddRole}
        getPositionNames={getPositionNames}
        getDepartmentNames={getDepartmentNames}
      />

      <AddPermissionModal
        isOpen={showAddPerm}
        onClose={() => setShowAddPerm(false)}
        onSubmit={(name) => {
          if (permissions.includes(name)) return alert("สิทธิ์นี้มีอยู่แล้ว");
          setPermissions((prev) => [...prev, name]);
          setRoles((prev) =>
            prev.map((r) => ({
              ...r,
              permissions: { ...(r.permissions || {}), [name]: false },
            }))
          );
          setShowAddPerm(false);
          alert("เพิ่มสิทธิ์ใหม่เรียบร้อยแล้ว!");
        }}
      />
    </div>
  );
}
