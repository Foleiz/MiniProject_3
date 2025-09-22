import React, { useState, useEffect } from "react";
import "../css/ManageRoles.css";
import Swal from "sweetalert2";

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
          <button className="btn-cancel-add" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit-add"
            onClick={() => {
              if (!name.trim()) {
                Swal.fire({
                  icon: "error",
                  title: "ผิดพลาด",
                  text: `กรุณากรอก${label}`,
                });
                return;
              }
              onSubmit(name.trim());
            }}
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
          <button className="btn-cancel-edit" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit-edit"
            onClick={() => {
              if (!name.trim()) {
                Swal.fire({
                  icon: "error",
                  title: "ผิดพลาด",
                  text: `กรุณากรอก${label}`,
                });
                return;
              }
              onSubmit(item.dbId, name.trim());
            }}
          >
            บันทึก
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
    const r = await fetch(`${API_BASE_URL}/${path}/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error("create failed");
    await list();
  };

  const update = async (dbId, name) => {
    // use the same key the backend expects
    const body = { [keys.postNameKey]: name };
    const r = await fetch(`${API_BASE_URL}/${path}/db/${dbId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error("update failed");
    await list();
  };

  const removeMany = async (ids) => {
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`${API_BASE_URL}/${path}/db/${id}`, { method: "DELETE" })
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
    if (!selected.length) {
      return Swal.fire({
        icon: "warning",
        title: "คำเตือน",
        text: "กรุณาเลือกรายการที่ต้องการลบ",
      });
    }
    const result = await Swal.fire({
      title: `ต้องการลบ ${selected.length} รายการ?`,
      text: "การดำเนินการนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;

    try {
      await removeMany(selected);
      setSelected([]);
      Swal.fire("สำเร็จ!", "ลบรายการเรียบร้อยแล้ว", "success");
    } catch {
      Swal.fire("ผิดพลาด!", "มีข้อผิดพลาดในการลบบางรายการ", "error");
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
                  <svg
                    className="setting-btn-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                  แก้ไข
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
            Swal.fire({
              icon: "success",
              title: "สำเร็จ",
              text: `เพิ่ม${label}ใหม่เรียบร้อยแล้ว!`,
            });
          } catch {
            Swal.fire({
              icon: "error",
              title: "ผิดพลาด",
              text: `ไม่สามารถเพิ่ม${label}ได้ กรุณาลองใหม่`,
            });
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
            Swal.fire({
              icon: "success",
              title: "สำเร็จ",
              text: `แก้ไขข้อมูล${label}เรียบร้อยแล้ว!`,
            });
          } catch {
            Swal.fire({
              icon: "error",
              title: "ผิดพลาด",
              text: `ไม่สามารถแก้ไข${label}ได้ กรุณาลองใหม่`,
            });
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
          <h3>เพิ่มหัวข้อ</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>ชื่อหัวข้อสิทธิ์</label>
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
          <button className="btn-cancel-main" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit-main"
            onClick={() => {
              if (!permissionName.trim()) {
                Swal.fire({
                  icon: "error",
                  title: "ผิดพลาด",
                  text: "กรุณากรอกชื่อสิทธิ์",
                });
                return;
              }
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
          <button className="btn-cancel-main" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="btn-submit-main"
            onClick={() => {
              if (!positionType || !departmentType) {
                Swal.fire({
                  icon: "error",
                  title: "ผิดพลาด",
                  text: "กรุณาเลือกให้ครบ",
                });
                return;
              }
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
        <span className="home-icon"></span>
        <h1 className="tab-title"></h1>
      </div>
      <div className="header-right">
        <button className="btn-save-main" onClick={onSave}>
          บันทึก
        </button>
        <button className="btn-add-main" onClick={onAdd}>
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
                  +
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
                    className="deleteButton"
                    onClick={() => onRoleDelete(role.id)}
                  >
                    <svg
                      viewBox="0 0 15 17.5"
                      height="17.5"
                      width="15"
                      xmlns="http://www.w3.org/2000/svg"
                      className="bin"
                    >
                      <path
                        transform="translate(-2.5 -1.25)"
                        d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z"
                      ></path>
                    </svg>
                    <div className="tooltip">ลบบทบาท</div>
                  </button>
                </div>
              </td>
            ))}
            <td className="empty-cell" />
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.PermissionID}>
              <td className="permission-name">
                <div className="permission-row">
                  <span>{perm.PermissionName}</span>
                  <button
                    className="deleteButton"
                    onClick={() =>
                      onPermissionDelete(perm.PermissionID, perm.PermissionName)
                    }
                  >
                    <svg
                      viewBox="0 0 15 17.5"
                      height="17.5"
                      width="15"
                      xmlns="http://www.w3.org/2000/svg"
                      className="bin"
                    >
                      <path
                        transform="translate(-2.5 -1.25)"
                        d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z"
                      ></path>
                    </svg>
                    <div className="tooltip">ลบสิทธิ์</div>
                  </button>
                </div>
              </td>
              {roles.map((role) => (
                <td
                  key={`${role.id}-${perm.PermissionID}`}
                  className="permission-cell"
                >
                  <input
                    type="checkbox"
                    className="permission-checkbox"
                    checked={role.permissions?.[perm.PermissionName] || false}
                    onChange={(e) =>
                      onPermissionToggle(
                        role.id,
                        perm.PermissionName,
                        e.target.checked
                      )
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
  const [permissions, setPermissions] = useState([]);

  // สำหรับ modal เพิ่มบทบาท: ดึงชื่อจาก API จริง (reuse normalizer)
  const [posNames, setPosNames] = useState([]);
  const [depNames, setDepNames] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const [posRes, depRes, permRes] = await Promise.all([
          fetch(`${API_BASE_URL}/positions`),
          fetch(`${API_BASE_URL}/departments`),
          fetch(`${API_BASE_URL}/permissions`),
        ]);

        if (posRes.ok) {
          setPosNames(
            normalize(await posRes.json(), "P", {
              idLower: "position_id",
              idUpper: "PositionID",
              nameLower: "position_name",
              nameUpper: "PositionName",
            }).map((x) => x.name)
          );
        }
        if (depRes.ok) {
          setDepNames(
            normalize(await depRes.json(), "D", {
              idLower: "department_id",
              idUpper: "DepartmentID",
              nameLower: "department_name",
              nameUpper: "DeptName",
            }).map((x) => x.name)
          );
        }
        if (permRes.ok) {
          setPermissions(await permRes.json());
        } else {
          console.error("Failed to fetch permissions");
          Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลสิทธิ์ได้", "error");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลเริ่มต้นได้", "error");
      }
    })();
  }, []);

  const getPositionNames = () => posNames;
  const getDepartmentNames = () => depNames;

  const handleRoleDelete = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบบทบาทนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
    Swal.fire({
      title: "สำเร็จ!",
      text: "ลบบทบาทเรียบร้อยแล้ว",
      icon: "success",
    });
  };

  const handlePermissionToggle = (roleId, permName, checked) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          permissions: { ...(r.permissions || {}), [permName]: checked },
        };
      })
    );
  };

  const handlePermissionDelete = async (permissionId, permissionName) => {
    const result = await Swal.fire({
      title: `คุณแน่ใจหรือไม่?`,
      text: `คุณต้องการลบสิทธิ์ "${permissionName}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/permissions/db/${permissionId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Delete failed on server");

      setPermissions((prev) =>
        prev.filter((p) => p.PermissionID !== permissionId)
      );
      setRoles((prev) =>
        prev.map((r) => {
          if (r.permissions?.[permissionName]) {
            const cp = { ...r.permissions };
            delete cp[permissionName];
            return { ...r, permissions: cp };
          }
          return r;
        })
      );
      Swal.fire("สำเร็จ!", "ลบสิทธิ์เรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("Error deleting permission:", err);
      Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการลบสิทธิ์", "error");
    }
  };

  const handleAddRole = ({ position, department }) => {
    const id = `role_${Date.now()}`;
    const perms = permissions.reduce(
      (acc, p) => ((acc[p.PermissionName] = false), acc),
      {}
    );
    setRoles((prev) => [
      ...prev,
      { id, name: position, description: department, permissions: perms },
    ]);
    setShowAddRole(false);
    Swal.fire({
      icon: "success",
      title: "สำเร็จ",
      text: "เพิ่มบทบาทใหม่เรียบร้อยแล้ว!",
    });
  };

  const handleAddPermission = async (name) => {
    if (permissions.some((p) => p.PermissionName === name)) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "สิทธิ์นี้มีอยู่แล้ว",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/permissions/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission_name: name }),
      });

      if (!response.ok) {
        throw new Error("Server responded with an error.");
      }

      const { item: newPermission } = await response.json();

      setPermissions((prev) => [...prev, newPermission]);
      setRoles((prev) =>
        prev.map((r) => ({
          ...r,
          permissions: {
            ...(r.permissions || {}),
            [newPermission.PermissionName]: false,
          },
        }))
      );

      setShowAddPerm(false);
      Swal.fire("สำเร็จ", "เพิ่มสิทธิ์ใหม่เรียบร้อยแล้ว!", "success");
    } catch (error) {
      console.error("Add permission error:", error);
      Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการเพิ่มสิทธิ์", "error");
    }
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
        <button className="tab-main" onClick={() => setActiveTab("main")}>
          เมนูหลัก
        </button>
        <button
          className="tab-position"
          onClick={() => setActiveTab("position")}
        >
          ตำแหน่ง
        </button>
        <button
          className="tab-department"
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
            onSave={() =>
              Swal.fire({
                icon: "success",
                title: "บันทึกแล้ว",
                text: "บันทึกข้อมูลเรียบร้อยแล้ว!",
              })
            }
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
        onSubmit={handleAddPermission}
      />
    </div>
  );
}
