import React, { useState, useEffect } from "react";
import "../css/DriverSchedule.css";
import Swal from "sweetalert2";

export default function DriverSchedule() {
  const [openAdd, setOpenAdd] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null); // State สำหรับเก็บข้อมูลที่จะแก้ไข

  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]); // เก็บข้อมูลรถ (จาก BUS)
  const [schedules, setSchedules] = useState([]);

  // ดึงข้อมูล schedule ทุกครั้งที่ component โหลด
  useEffect(() => {
    fetch("http://localhost:3000/routes")
      .then((r) => r.json())
      .then(setRoutes);
    fetch("http://localhost:3000/drivers")
      .then((r) => r.json())
      .then(setDrivers);
    fetch("http://localhost:3000/cars") // ดึงข้อมูลจากตาราง BUS
      .then((r) => r.json())
      .then((data) => {
        console.log("Cars Data:", data); // ตรวจสอบข้อมูลรถ
        setCars(data); // เก็บข้อมูลรถลงใน state
      });

    fetch("http://localhost:3000/schedules")
      .then((r) => r.json())
      .then((data) => {
        console.log("Schedules Data:", data); // ตรวจสอบข้อมูลตารางการขับขี่
        setSchedules(Array.isArray(data) ? data : []);
      });
  }, []);

  // ฟังก์ชันสำหรับเปิด Edit Modal
  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
  };

  const handleDelete = async (scheduleToDelete) => {
    const { routeId, round, scheduleDate } = scheduleToDelete;
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: `คุณต้องการลบตารางเดินรถวันที่ ${new Date(
        scheduleDate
      ).toLocaleDateString("th-TH")} รอบที่ ${round} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      await fetch("http://localhost:3000/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [{ routeId, round, scheduleDate }] }),
      });
      setSchedules((prev) =>
        prev.filter(
          (s) =>
            !(
              s.routeId === routeId &&
              s.round === round &&
              s.scheduleDate === scheduleDate
            )
        )
      );
      Swal.fire("ลบแล้ว!", "ลบข้อมูลเรียบร้อย", "success");
    }
  };
  // จัดกลุ่ม schedules ตาม scheduleDate
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.scheduleDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  return (
    <div className="page">
      <main className="main">
        <h2>จัดตารางคนขับ</h2>
        <section className="card">
          <div className="toolbar">
            <button className="btn btn--add" onClick={() => setOpenAdd(true)}>
              <svg
                className="svg-icon"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="#fff" strokeLinecap="round" strokeWidth="1.5">
                  <path d="m10 3.5v13" />
                  <path d="m3.5 10h13" />
                </g>
              </svg>
              <span className="add-label">เพิ่ม</span>
            </button>
          </div>

          {/* ตรวจสอบว่ามีข้อมูลใน schedules หรือไม่ */}
          {schedules.length === 0 ? (
            <div className="no-routes">
              ยังไม่มีตารางการเดินรถ กรุณากดปุ่ม "Add"
            </div>
          ) : (
            <div className="routes-grid">
              {Object.entries(groupedSchedules).map(
                ([date, dailySchedules]) => (
                  <div key={date} className="route-table">
                    <div className="route-header">
                      <span>
                        <strong>วันที่:</strong>{" "}
                        {new Date(date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <table className="route-points-table">
                      <thead>
                        <tr>
                          <th>เส้นทาง</th>
                          <th>รอบ</th>
                          <th>เวลา</th>
                          <th>คนขับ</th>
                          <th>รถ</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailySchedules.map((s, index) => (
                          <tr key={`${s.routeId}-${s.round}-${index}`}>
                            <td>
                              {routes.find((r) => r.id === s.routeId)?.name ||
                                "N/A"}
                            </td>
                            <td>{s.round}</td>
                            <td>{s.scheduleTime}</td>
                            <td>
                              {drivers.find((d) => d.id === s.driverId)?.name ||
                                "N/A"}
                            </td>
                            <td>
                              {cars.find((c) => c.id === s.busId)
                                ?.plateNumber || "N/A"}
                            </td>
                            <td className="actions-cell">
                              <button
                                className="btn-edit-row"
                                onClick={() => handleEdit(s)}
                              >
                                แก้ไข
                              </button>
                              <button
                                className="btn-delete-row"
                                onClick={() => handleDelete(s)}
                              >
                                ลบ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>

      {/* Add Modal */}
      {openAdd && (
        <AddModal
          onClose={() => setOpenAdd(false)}
          setSchedules={setSchedules}
          routes={routes}
          drivers={drivers}
          cars={cars} // ส่งข้อมูล cars ไปที่ AddModal
        />
      )}

      {/* Edit Modal */}
      {editingSchedule && (
        <EditModal
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          setSchedules={setSchedules}
          routes={routes}
          drivers={drivers}
          cars={cars} // ส่งข้อมูล cars ไปที่ EditModal
        />
      )}
    </div>
  );
}

/* ---------- Add Modal ---------- */
function AddModal({ onClose, setSchedules, routes, drivers, cars }) {
  const [routeId, setRouteId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rounds, setRounds] = useState([{ time: "", driverId: "", carId: "" }]);

  const addRound = () =>
    setRounds((rs) => [...rs, { time: "", driverId: "", carId: "" }]);
  const update = (i, k, v) =>
    setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  const submit = async () => {
    const data = { routeId, startDate, endDate, rounds };
    await fetch("http://localhost:3000/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // ดึงข้อมูลใหม่หลังจากเพิ่มเสร็จ
    const res = await fetch("http://localhost:3000/schedules");
    const newSchedules = await res.json();
    setSchedules(Array.isArray(newSchedules) ? newSchedules : []);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">จัดตารางคนขับ</h3>
        <div className="inputRow">
          <label>วันที่เริ่มต้น</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="dateInput"
          />
        </div>
        <div className="inputRow">
          <label>วันที่สิ้นสุด</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="dateInput"
          />
        </div>
        <div className="routeRow">
          <select
            className="routeSelect"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            disabled={routes.length === 0}
          >
            <option value="">
              {routes.length ? "เลือกเส้นทาง..." : "ไม่มีข้อมูลเส้นทาง"}
            </option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rowsWrap">
          {rounds.map((r, i) => (
            <div key={i} className="row">
              <div className="cellLabel">{`รอบที่ ${i + 1} เวลา`}</div>
              <input
                type="time"
                className="timeInput"
                value={r.time}
                onChange={(e) => update(i, "time", e.target.value)}
              />
              <div className="cellTag">คนขับ</div>
              <select
                className="selectInput"
                value={r.driverId}
                onChange={(e) => update(i, "driverId", e.target.value)}
                disabled={drivers.length === 0}
              >
                <option value="">
                  {drivers.length ? "เลือกคนขับ..." : "ไม่มีข้อมูลคนขับ"}
                </option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="cellTag">รถ</div>
              <select
                className="selectInput"
                value={r.carId}
                onChange={(e) => update(i, "carId", e.target.value)}
                disabled={cars.length === 0}
              >
                <option value="">
                  {cars.length ? "เลือกรถ..." : "ไม่มีข้อมูลรถ"}
                </option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.plateNumber} {/* ใช้ plateNumber แสดงหมายเลขทะเบียนรถ */}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="addRowWrap">
            <button type="button" className="plusBtn" onClick={addRound}>
              ＋
            </button>
          </div>
        </div>
        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="button" className="btn confirmBtn" onClick={submit}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Edit Modal ---------- */
function EditModal({ schedule, onClose, setSchedules, drivers, cars }) {
  const [formData, setFormData] = useState({
    routeId: schedule.routeId,
    scheduleDate: schedule.scheduleDate,
    round: schedule.round,
    time: schedule.scheduleTime,
    driverId: schedule.driverId,
    carId: schedule.busId,
  });

  useEffect(() => {
    // Reset form data if the schedule prop changes
    setFormData({
      routeId: schedule.routeId,
      scheduleDate: schedule.scheduleDate,
      round: schedule.round,
      time: schedule.scheduleTime,
      driverId: schedule.driverId,
      carId: schedule.busId,
    });
  }, [schedule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update schedule");

      // อัปเดต State ในหน้าหลัก
      setSchedules((prev) =>
        prev.map((s) =>
          s.routeId === schedule.routeId &&
          s.round === schedule.round &&
          s.scheduleDate === schedule.scheduleDate
            ? {
                ...s,
                scheduleTime: formData.time,
                driverId: formData.driverId,
                busId: formData.carId,
              }
            : s
        )
      );

      Swal.fire("สำเร็จ!", "แก้ไขข้อมูลเรียบร้อย", "success");
      onClose();
    } catch (error) {
      console.error("Error updating schedule:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถแก้ไขข้อมูลได้", "error");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">แก้ไขตารางคนขับ</h3>
        <div className="rowsWrap">
          <div className="inputRow">
            <label>เวลา</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="timeInput"
            />
          </div>
          <div className="inputRow">
            <label>คนขับ</label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              className="selectInput"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="inputRow">
            <label>รถ</label>
            <select
              name="carId"
              value={formData.carId}
              onChange={handleChange}
              className="selectInput"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.plateNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn confirmBtn"
            onClick={handleSubmit}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
