import React, { useEffect, useState } from "react";
import "../css/VehicleInfo.css";

export default function VehicleInfo() {
  const [search, setSearch] = useState("");
  const [buses, setBuses] = useState([]);
  const [busTypes, setBusTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    BusID: "",
    PlateNumber: "",
    Status: "",
    BusTypeID: "",
  });

  // โหลดข้อมูลรถ
  const fetchBuses = async () => {
    try {
      const res = await fetch("http://localhost:3000/buses");
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchBuses error:", err);
    }
  };

  // โหลดข้อมูลประเภทรถ
  const fetchBusTypes = async () => {
    try {
      const res = await fetch("http://localhost:3000/bustype");
      const data = await res.json();
      setBusTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchBusTypes error:", err);
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchBusTypes();
  }, []);

  // ฟังก์ชันเปลี่ยนค่า form
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // เพิ่มรถใหม่
  const handleAdd = async () => {
    await fetch("http://localhost:3000/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    fetchBuses();
    closeModal();
  };

  // แก้ไขรถ
  const handleEdit = (bus) => {
    setIsEdit(true);
    setForm(bus);
    setShowModal(true);
  };

  // อัปเดต
  const handleUpdate = async () => {
    await fetch(`http://localhost:3000/buses/${form.BusID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    fetchBuses();
    closeModal();
  };

  // ลบ
  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบ?")) return;
    await fetch(`http://localhost:3000/buses/${id}`, { method: "DELETE" });
    fetchBuses();
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setForm({ BusID: "", PlateNumber: "", Status: "", BusTypeID: "" });
  };

  // filter เสิร์ช ข้อมูล
  const filteredBuses = buses.filter(
    (bus) =>
      bus.BusID?.toLowerCase().includes(search.toLowerCase()) ||
      bus.PlateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      bus.TypeName?.toLowerCase().includes(search.toLowerCase()) ||
      bus.Status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vehicleinfo-container">
      {/* คอลัมบน*/}
      <div className="vehicleinfo-top-box">
        <h3>จัดการข้อมูลรถในระบบ</h3>
        <div className="vehicleinfo-top-row">
          <div className="vehicleinfo-search-box">
            <input
              type="text"
              placeholder="ค้นหาข้อมูลรถ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button
            className="vehicleinfo-btn-add"
            onClick={() => setShowModal(true)}
          >
            เพิ่มรถใหม่
          </button>
        </div>
      </div>

      {/* คอลัมล่าง โชว์ข้อมูลรถ*/}
      <div className="vehicleinfo-table-box">
        <table>
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อประเภทรถ</th>
              <th>เลขทะเบียนรถ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus) => (
                <tr key={bus.BusID}>
                  <td>{bus.BusID}</td>
                  <td>{bus.TypeName}</td>
                  <td>{bus.PlateNumber}</td>
                  <td>{bus.Status}</td>
                  <td>
                    <button
                      className="vehicleinfo-btn-edit"
                      onClick={() => handleEdit(bus)}
                    >
                      ✏️
                    </button>
                    <button
                      className="vehicleinfo-btn-delete"
                      onClick={() => handleDelete(bus.BusID)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">ไม่มีข้อมูลรถ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal หน้า alertเพิ่มรถ*/}
      {showModal && (
        <div className="vehicleinfo-modal-overlay">
          <div className="vehicleinfo-modal-content">
            <h3>{isEdit ? "แก้ไขข้อมูลรถ" : "เพิ่มข้อมูลรถ"}</h3>
            <input
              name="BusID"
              placeholder="รหัสรถ"
              onChange={handleChange}
              value={form.BusID}
              disabled={isEdit}
            />
            <input
              name="PlateNumber"
              placeholder="ทะเบียนรถ"
              onChange={handleChange}
              value={form.PlateNumber}
            />
            <select
              name="BusTypeID"
              onChange={handleChange}
              value={form.BusTypeID}
            >
              <option value="">เลือกประเภทรถ</option>
              {busTypes.map((bt) => (
                <option key={bt.BusTypeID} value={bt.BusTypeID}>
                  {bt.TypeName}
                </option>
              ))}
            </select>
            <select name="Status" onChange={handleChange} value={form.Status}>
              <option value="">เลือกสถานะรถ</option>
              <option value="ใช้งาน">ใช้งาน</option>
              <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
            </select>
            <div className="vehicleinfo-modal-actions">
              <button onClick={closeModal}>ยกเลิก</button>
              {isEdit ? (
                <button className="vehicleinfo-btn-add" onClick={handleUpdate}>
                  บันทึกการแก้ไข
                </button>
              ) : (
                <button className="vehicleinfo-btn-add" onClick={handleAdd}>
                  เพิ่มรถใหม่
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
