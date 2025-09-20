// DriverSchedule.jsx
import { useState, useEffect } from "react";
import "../styles/DriverSchedule.css";


export default function DriverSchedule() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // รอเชื่อม API ภายหลัง
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    // fetch('/api/routes').then(r=>r.json()).then(setRoutes);
    // fetch('/api/drivers').then(r=>r.json()).then(setDrivers);
    // fetch('/api/cars').then(r=>r.json()).then(setCars);
  }, []);

  return (
    <div className="page">
      <main className="main">
        <h2>Driver Schedule</h2>

        <section className="card">
          <div className="toolbar">
            <button className="btn btn--add" onClick={() => setOpenAdd(true)}>Add</button>
            <button className="btn btn--edit" onClick={() => setOpenEdit(true)}>Edit</button>
            <button className="btn btn--del" onClick={() => setOpenDelete(true)}>Delete</button>
          </div>

          <div className="empty">ยังไม่มีข้อมูลตาราง</div>
        </section>
      </main>

      {openAdd && <AddModal onClose={() => setOpenAdd(false)} routes={routes} drivers={drivers} cars={cars} />}
      {openEdit && <EditModal onClose={() => setOpenEdit(false)} routes={routes} drivers={drivers} cars={cars} />}
      {openDelete && <DeleteModal onClose={() => setOpenDelete(false)} routes={routes} />}
    </div>
  );
}

/* ---------- Add Modal ---------- */
function AddModal({ onClose, routes, drivers, cars }) {
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const [rounds, setRounds] = useState([
    { time: "", driverId: "", carId: "" },
    { time: "", driverId: "", carId: "" },
    { time: "", driverId: "", carId: "" },
    { time: "", driverId: "", carId: "" },
  ]);

  const update = (i, k, v) => setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRound = () => setRounds((rs) => [...rs, { time: "", driverId: "", carId: "" }]);

  const submit = () => {
    console.log({ action: "add", routeId, rounds });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">จัดตารางคนขับ</h3>

        <div className="routeRow">
          <select
            className="routeSelect"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            disabled={routes.length === 0}
          >
            <option value="">{routes.length ? "เลือกเส้นทาง..." : "ไม่มีข้อมูลเส้นทาง"}</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="rowsWrap">
          {rounds.map((r, i) => (
            <div key={i} className="row">
              <div className="cellLabel">{`รอบที่ ${i + 1} เวลา`}</div>
              <input type="time" className="timeInput" value={r.time} onChange={(e) => update(i, "time", e.target.value)} />

              <div className="cellTag">คนขับ</div>
              <select
                className="selectInput"
                value={r.driverId}
                onChange={(e) => update(i, "driverId", e.target.value)}
                disabled={drivers.length === 0}
              >
                <option value="">{drivers.length ? "เลือกคนขับ..." : "ไม่มีข้อมูลคนขับ"}</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <div className="cellTag">รถ</div>
              <select
                className="selectInput"
                value={r.carId}
                onChange={(e) => update(i, "carId", e.target.value)}
                disabled={cars.length === 0}
              >
                <option value="">{cars.length ? "เลือกรถ..." : "ไม่มีข้อมูลรถ"}</option>
                {cars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ))}

          <div className="addRowWrap">
            <button type="button" className="plusBtn" onClick={addRound}>＋</button>
          </div>
        </div>

        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>ยกเลิก</button>
          <button type="button" className="btn confirmBtn" onClick={submit}>ยืนยัน</button>
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
    if (!routeId) { setRounds([]); return; }
    // fetch(`/api/routes/${routeId}/rounds`).then(r=>r.json()).then(setRounds)
    setRounds([
      { time: "09:00", driverId: "", carId: "" },
      { time: "11:30", driverId: "", carId: "" },
    ]);
  }, [routeId]);

  const update = (i, k, v) => setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRound = () => setRounds((rs) => [...rs, { time: "", driverId: "", carId: "" }]);

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
            <option value="">{routes.length ? "เลือกเส้นทาง..." : "ไม่มีข้อมูลเส้นทาง"}</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {routeId === "" && <div className="hint">เลือกเส้นทางเพื่อแก้ไข</div>}

        <div className="rowsWrap">
          {rounds.map((r, i) => (
            <div key={i} className="row">
              <div className="cellLabel">{`รอบที่ ${i + 1} เวลา`}</div>
              <input type="time" className="timeInput" value={r.time} onChange={(e) => update(i, "time", e.target.value)} disabled={disabledFields} />

              <div className="cellTag">คนขับ</div>
              <select className="selectInput" value={r.driverId} onChange={(e) => update(i, "driverId", e.target.value)} disabled={disabledFields || drivers.length === 0}>
                <option value="">{drivers.length ? "เลือกคนขับ..." : "ไม่มีข้อมูลคนขับ"}</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <div className="cellTag">รถ</div>
              <select className="selectInput" value={r.carId} onChange={(e) => update(i, "carId", e.target.value)} disabled={disabledFields || cars.length === 0}>
                <option value="">{cars.length ? "เลือกรถ..." : "ไม่มีข้อมูลรถ"}</option>
                {cars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ))}

          <div className="addRowWrap">
            <button type="button" className="plusBtn" onClick={addRound} disabled={!routeId}>＋</button>
          </div>
        </div>

        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>ยกเลิก</button>
          <button type="button" className="btn confirmBtn" onClick={submit} disabled={!routeId}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Delete Modal ---------- */
function DeleteModal({ onClose, routes }) {
  const [checked, setChecked] = useState(new Set());
  const allChecked = routes.length > 0 && checked.size === routes.length;

  const toggle = (id) =>
    setChecked((s) => {
      const t = new Set(s);
      t.has(id) ? t.delete(id) : t.add(id);
      return t;
    });

  const toggleAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(routes.map((r) => r.id)));
  };

  const submit = async () => {
    if (checked.size === 0) return;
    const ok = window.confirm(`ยืนยันการลบเส้นทางจำนวน ${checked.size} รายการ?`);
    if (!ok) return;

    // ถ้ามีแบ็กเอนด์ ให้เรียก API จริงได้ที่นี่
    // await fetch("/api/routes", {
    //   method: "DELETE",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ ids: Array.from(checked) }),
    // });

    alert("ลบเส้นทางสำเร็จ");
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="title">ลบเส้นทาง</h3>

        <div className="listWrap">
          <div className="listHead">เส้นทาง</div>
          <div className="listBox">
            {routes.length === 0 ? (
              <div className="hint">ไม่มีข้อมูลเส้นทาง</div>
            ) : (
              routes.map((r, idx) => (
                <label key={r.id} className="listRow">
                  <span>{idx + 1}. {r.name}</span>
                  <input
                    type="checkbox"
                    checked={checked.has(r.id)}
                    onChange={() => toggle(r.id)}
                  />
                </label>
              ))
            )}
          </div>

          <label className="checkAll">
            <input
              type="checkbox"
              disabled={routes.length === 0}
              checked={allChecked}
              onChange={toggleAll}
            />
            <span className="ml8">เลือกทั้งหมด</span>
          </label>
        </div>

        <div className="footer">
          <button type="button" className="btn cancelBtn" onClick={onClose}>ยกเลิก</button>
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
