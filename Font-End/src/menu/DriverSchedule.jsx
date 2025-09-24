import React, { useState, useEffect } from "react";
import "../css/DriverSchedule.css";

export default function DriverSchedule() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

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

  return (
    <div className="page">
      <main className="main">
        <h2>Driver Schedule</h2>
        <section className="card">
          <div className="toolbar">
            <button className="btn btn--add" onClick={() => setOpenAdd(true)}>
              Add
            </button>
            <button className="btn btn--edit" onClick={() => setOpenEdit(true)}>
              Edit
            </button>
            <button
              className="btn btn--del"
              onClick={() => setOpenDelete(true)}
            >
              Delete
            </button>
          </div>

          {/* ตรวจสอบว่ามีข้อมูลใน schedules หรือไม่ */}
          {schedules.length === 0 ? (
            <div className="empty">ไม่มีข้อมูล</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ชื่อเส้นทาง</th>
                  <th>รอบที่</th>
                  <th>เวลา</th>
                  <th>คนขับ</th>
                  <th>รถ</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.routeId}>
                    {/* ชื่อเส้นทาง */}
                    <td>
                      {routes.find((r) => r.id === s.routeId)?.name ||
                        "ไม่พบข้อมูล"}
                    </td>
                    {/* รอบที่ */}
                    <td>{s.round}</td>
                    {/* เวลา */}
                    <td>{s.scheduleTime}</td>
                    {/* คนขับ */}
                    <td>
                      {drivers.find((d) => d.id === s.driverId)?.name ||
                        "ไม่พบข้อมูล"}
                    </td>
                    {/* รถ */}
                    <td>
                      {cars.find((c) => c.id === s.busId)?.plateNumber ||
                        "ไม่พบข้อมูล"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      {openEdit && (
        <EditModal
          onClose={() => setOpenEdit(false)}
          routes={routes}
          drivers={drivers}
          cars={cars} // ส่งข้อมูล cars ไปที่ EditModal
        />
      )}

      {/* Delete Modal */}
      {openDelete && (
        <DeleteModal
          onClose={() => setOpenDelete(false)}
          schedules={schedules}
          setSchedules={setSchedules}
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
function EditModal({ onClose, routes, drivers, cars }) {
  const [routeId, setRouteId] = useState("");
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    if (!routeId) {
      setRounds([]);
      return;
    }
    // fetch(`/api/routes/${routeId}/rounds`).then(r=>r.json()).then(setRounds)
    setRounds([
      { time: "09:00", driverId: "", carId: "" },
      { time: "11:30", driverId: "", carId: "" },
    ]);
  }, [routeId]);

  const update = (i, k, v) =>
    setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRound = () =>
    setRounds((rs) => [...rs, { time: "", driverId: "", carId: "" }]);

  const submit = () => {
    console.log({ action: "edit", routeId, rounds });
    onClose();
  };

  const disabledFields = !routeId;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">แก้ไขตารางคนขับ</h3>

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

        {routeId === "" && <div className="hint">เลือกเส้นทางเพื่อแก้ไข</div>}

        <div className="rowsWrap">
          {rounds.map((r, i) => (
            <div key={i} className="row">
              <div className="cellLabel">{`รอบที่ ${i + 1} เวลา`}</div>
              <input
                type="time"
                className="timeInput"
                value={r.time}
                onChange={(e) => update(i, "time", e.target.value)}
                disabled={disabledFields}
              />

              <div className="cellTag">คนขับ</div>
              <select
                className="selectInput"
                value={r.driverId}
                onChange={(e) => update(i, "driverId", e.target.value)}
                disabled={disabledFields || drivers.length === 0}
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
                disabled={disabledFields || cars.length === 0}
              >
                <option value="">
                  {cars.length ? "เลือกรถ..." : "ไม่มีข้อมูลรถ"}
                </option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.plateNumber}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="addRowWrap">
            <button
              type="button"
              className="plusBtn"
              onClick={addRound}
              disabled={!routeId}
            >
              ＋
            </button>
          </div>
        </div>

        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn confirmBtn"
            onClick={submit}
            disabled={!routeId}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Delete Modal ---------- */
function DeleteModal({ onClose, schedules, setSchedules }) {
  const [checked, setChecked] = useState(new Set());
  const allChecked = schedules.length > 0 && checked.size === schedules.length;

  const toggle = (id) =>
    setChecked((s) => {
      const t = new Set(s);
      t.has(id) ? t.delete(id) : t.add(id);
      return t;
    });

  const toggleAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(schedules.map((s) => s.id)));
  };

  const submit = async () => {
    if (checked.size === 0) return;
    const ok = window.confirm(`ยืนยันการลบตารางจำนวน ${checked.size} รายการ?`);
    if (!ok) return;

    // เรียก API ลบ schedule (คุณต้องมี endpoint DELETE /schedules)
    await fetch("http://localhost:3000/schedules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(checked) }),
    });

    // ดึงข้อมูลใหม่
    const res = await fetch("http://localhost:3000/schedules");
    const newSchedules = await res.json();
    setSchedules(Array.isArray(newSchedules) ? newSchedules : []);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">ลบตารางคนขับ</h3>
        <div className="listWrap">
          <div className="listHead">ตารางคนขับ</div>
          <div className="listBox">
            {schedules.length === 0 ? (
              <div className="hint">ไม่มีข้อมูลตาราง</div>
            ) : (
              schedules.map((s, idx) => (
                <label key={s.id} className="listRow">
                  <span>
                    {idx + 1}. {s.routeName || s.routeId} |{" "}
                    {s.startDate || s.scheduleDateTime}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked.has(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                </label>
              ))
            )}
          </div>
          <label className="checkAll">
            <input
              type="checkbox"
              disabled={schedules.length === 0}
              checked={allChecked}
              onChange={toggleAll}
            />
            <span className="ml8">เลือกทั้งหมด</span>
          </label>
        </div>
        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn confirmBtn"
            onClick={submit}
            disabled={checked.size === 0}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
