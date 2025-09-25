import React, { useEffect, useState } from "react";
import "../css/vehicletype.css";
import Swal from "sweetalert2";

function VehicleType() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    BusTypeID: "",
    TypeName: "",
    Capacity: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState([]);

  const API_URL = "http://localhost:3000/bustype";

  // Filter vehicles based on search
  const q = search.toLowerCase();
  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.TypeName.toLowerCase().includes(q)
  );

  // Fetch data from backend
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setVehicles([]);
      });
  }, []);

  // Delete multiple items
  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      Swal.fire("ไม่ได้เลือก", "กรุณาเลือกรายการที่ต้องการลบ", "warning");
      return;
    }

    const result = await Swal.fire({
      title: `คุณแน่ใจหรือไม่?`,
      text: `คุณกำลังจะลบ ${selected.length} รายการ`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        selected.map((id) => fetch(`${API_URL}/${id}`, { method: "DELETE" }))
      );

      setVehicles((prev) =>
        prev.filter((v) => !selected.includes(v.BusTypeID))
      );
      setSelected([]);
      Swal.fire("ลบแล้ว!", "รายการที่เลือกถูกลบเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("Bulk delete error:", error);
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    }
  };

  // Edit item
  const handleEdit = (vehicle) => {
    setForm({
      BusTypeID: vehicle.BusTypeID,
      TypeName: vehicle.TypeName,
      Capacity: vehicle.Capacity,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Add new item
  const handleAdd = () => {
    setForm({
      BusTypeID: "",
      TypeName: "",
      Capacity: "",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      BusTypeID: form.BusTypeID.trim(),
      TypeName: form.TypeName.trim(),
      Capacity: parseInt(form.Capacity),
    };

    if (!payload.BusTypeID || !payload.TypeName || isNaN(payload.Capacity)) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_URL}/${payload.BusTypeID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setVehicles((prev) =>
            prev.map((v) =>
              v.BusTypeID === payload.BusTypeID
                ? {
                    ...v,
                    TypeName: payload.TypeName,
                    Capacity: payload.Capacity,
                  }
                : v
            )
          );
        }
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setVehicles((prev) => [
            ...prev,
            {
              BusTypeID: payload.BusTypeID,
              TypeName: payload.TypeName,
              Capacity: payload.Capacity,
            },
          ]);
        }
      }

      if (!response.ok) throw new Error("Request failed");

      setShowForm(false);
      setForm({ BusTypeID: "", TypeName: "", Capacity: "" });
      Swal.fire(
        "สำเร็จ!",
        `ข้อมูลถูก${isEditing ? "แก้ไข" : "เพิ่ม"}เรียบร้อยแล้ว`,
        "success"
      );
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    }
  };

  // Close form when clicking overlay
  const handleOverlayClick = () => {
    setShowForm(false);
  };

  // Toggle select single item
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle select all items
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredVehicles.map((v) => v.BusTypeID));
    } else {
      setSelected([]);
    }
  };

  return (
    <div className="vehicletype-container">
      <div className="header">
        <h2>รายการประเภทรถ</h2>
        <div className="header-buttons">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหาตามชื่อประเภทรถ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-red" onClick={handleDeleteSelected}>
            ลบ ({selected.length})
          </button>
          <button className="btn btn-green" onClick={handleAdd}>
            สร้างประเภทรถใหม่
          </button>
        </div>
      </div>

      <table className="vehicle-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={
                  filteredVehicles.length > 0 &&
                  selected.length === filteredVehicles.length
                }
              />
            </th>
            <th>รหัส</th>
            <th>ชื่อประเภทรถ</th>
            <th>จำนวนที่นั่ง</th>
            <th>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(filteredVehicles) && filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <tr key={vehicle.BusTypeID}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(vehicle.BusTypeID)}
                    onChange={() => toggleSelect(vehicle.BusTypeID)}
                  />
                </td>
                <td>{vehicle.BusTypeID}</td>
                <td>{vehicle.TypeName}</td>
                <td>{vehicle.Capacity}</td>
                <td className="action-buttons">
                  <button
                    className="btn-edit-vehicle"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <svg
                      className="h-5 w-5 mr-1 self-center items-center"
                      fill="none"
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                    </svg>
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "gray" }}>
                ไม่พบข้อมูลประเภทรถ
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <div className="vehicletype-modal-overlay" onClick={handleOverlayClick}>
          <div
            className="vehicletype-modal-content"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h3>{isEditing ? "แก้ไขประเภทรถ" : "สร้างประเภทรถ"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="รหัสประเภทรถ"
                value={form.BusTypeID}
                onChange={(e) =>
                  setForm({ ...form, BusTypeID: e.target.value })
                }
                disabled={isEditing}
              />
              <input
                type="text"
                placeholder="ชื่อประเภทรถ"
                value={form.TypeName}
                onChange={(e) => setForm({ ...form, TypeName: e.target.value })}
              />
              <input
                type="number"
                placeholder="จำนวนที่นั่ง"
                value={form.Capacity}
                onChange={(e) => setForm({ ...form, Capacity: e.target.value })}
              />
              <div className="vehicletype-modal-buttons">
                <button type="submit" className="btn btn-green">
                  {isEditing ? "บันทึกการแก้ไข" : "สร้าง"}
                </button>
                <button
                  type="button"
                  className="btn btn-red"
                  onClick={() => setShowForm(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleType;
