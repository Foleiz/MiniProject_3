import React, { useMemo, useRef, useState } from "react";

// ใช้ .env: VITE_API_BASE_URL=http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Report2() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const fetchReport = async () => {
    setError("");
    if (!startDate || !endDate) return setError("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
    if (endDate < startDate) return setError("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น");

    // ยกเลิกรีเควสต์ก่อนหน้า ถ้ามี
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/report2?start=${startDate}&end=${endDate}`;
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        if (res.status === 503) throw new Error("ฐานข้อมูลยังไม่พร้อม (503)");
        throw new Error(`HTTP ${res.status} ${text || ""}`.trim());
      }
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "ดึงข้อมูลล้มเหลว");
        setRows([]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const clearReport = () => {
    setRows([]);
    setError("");
  };

  const resetDates = () => {
    setStartDate("");
    setEndDate("");
    setRows([]);
    setError("");
  };

  const computed = useMemo(() => {
    const map = rows
      .map((r) => {
        const total = Number(r.total || 0);
        const boarded = Number(r.boarded || 0);
        const canceled = Number(r.canceled || 0);
        const noShow = Math.max(total - boarded - canceled, 0);
        return { ...r, total, boarded, canceled, noShow };
      })
      .sort((a, b) => b.total - a.total);

    const summary = map.reduce(
      (a, r) => ({
        total: a.total + r.total,
        boarded: a.boarded + r.boarded,
        canceled: a.canceled + r.canceled,
        noShow: a.noShow + r.noShow,
      }),
      { total: 0, boarded: 0, canceled: 0, noShow: 0 }
    );

    return { rows: map, summary, countUsers: map.length };
  }, [rows]);

  const fmt = (n) => Number(n).toLocaleString();

  const exportCSV = () => {
    if (computed.rows.length === 0) return;
    const header = ["ผู้ใช้", "การจองทั้งหมด", "ขึ้นรถจริง", "ยกเลิก", "ไม่ขึ้นรถ"];
    const lines = [
      header.join(","),
      ...computed.rows.map((r) =>
        [
          `"${(r.userName || "").replace(/"/g, '""')}"`,
          r.total,
          r.boarded,
          r.canceled,
          r.noShow,
        ].join(",")
      ),
      ["รวม", computed.summary.total, computed.summary.boarded, computed.summary.canceled, computed.summary.noShow].join(","),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const fn = `report2_${startDate || "start"}_${endDate || "end"}.csv`;
    a.download = fn;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h2 style={{ color: "#333", marginBottom: "12px" }}>รายงานพฤติกรรมของผู้ใช้</h2>

      <div style={{ marginBottom: "6px", color: "#555", fontSize: 13 }}>
        {computed.rows.length > 0
          ? <>ช่วงวันที่ <strong>{startDate}</strong> ถึง <strong>{endDate}</strong> · ผู้ใช้ <strong>{computed.countUsers}</strong> คน · รวมการจอง <strong>{fmt(computed.summary.total)}</strong></>
          : "เลือกช่วงวันที่แล้วกด ดึงรายงาน"}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 8 }}>
        <div>
          <label style={{ fontSize: 14, marginBottom: 4, display: "block" }}>วันที่เริ่มต้น</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchReport()}
            style={{ padding: 8, fontSize: 14, border: "1px solid #ccc", borderRadius: 4, width: 200 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 14, marginBottom: 4, display: "block" }}>วันที่สิ้นสุด</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchReport()}
            min={startDate}
            style={{ padding: 8, fontSize: 14, border: "1px solid #ccc", borderRadius: 4, width: 200 }}
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={!startDate || !endDate || loading}
          style={{ padding: "10px 16px", fontSize: 14, borderRadius: 4, border: "1px solid #0a7", background: "#0a7", color: "#fff", cursor: "pointer", opacity: !startDate || !endDate || loading ? 0.6 : 1 }}
        >
          {loading ? "กำลังดึงข้อมูล..." : "ดึงรายงาน"}
        </button>

        <button
          onClick={clearReport}
          disabled={loading || computed.rows.length === 0}
          style={{ padding: "10px 16px", fontSize: 14, borderRadius: 4, border: "1px solid #999", background: "#fff", color: "#333", cursor: "pointer", opacity: loading || computed.rows.length === 0 ? 0.6 : 1 }}
        >
          ล้างผลลัพธ์
        </button>

        <button
          onClick={resetDates}
          disabled={loading}
          style={{ padding: "10px 16px", fontSize: 14, borderRadius: 4, border: "1px solid #999", background: "#fff", color: "#333", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
        >
          รีเซ็ตวันที่
        </button>

        <button
          onClick={exportCSV}
          disabled={computed.rows.length === 0}
          style={{ padding: "10px 16px", fontSize: 14, borderRadius: 4, border: "1px solid #067", background: "#067", color: "#fff", cursor: "pointer", opacity: computed.rows.length === 0 ? 0.6 : 1 }}
          title="ส่งออกไฟล์ CSV"
        >
          ส่งออก CSV
        </button>
      </div>

      {error && (
        <div style={{ color: "#b00", marginBottom: 8, whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      <div style={{ position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            กำลังโหลด...
          </div>
        )}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 8,
          }}
        >
          <thead>
            <tr>
              {["ผู้ใช้", "การจองทั้งหมด", "ขึ้นรถจริง", "ยกเลิก", "ไม่ขึ้นรถ"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: 12,
                    textAlign: "center",
                    border: "1px solid #ddd",
                    backgroundColor: "#f4f4f4",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {computed.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ border: "1px solid #eee", padding: 16, textAlign: "center", color: "#666" }}
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              computed.rows.map((r) => (
                <tr key={r.userId}>
                  <td style={{ border: "1px solid #eee", padding: 10 }}>{r.userName}</td>
                  <td style={{ border: "1px solid #eee", padding: 10, textAlign: "right" }}>{fmt(r.total)}</td>
                  <td style={{ border: "1px solid #eee", padding: 10, textAlign: "right" }}>{fmt(r.boarded)}</td>
                  <td style={{ border: "1px solid #eee", padding: 10, textAlign: "right" }}>{fmt(r.canceled)}</td>
                  <td style={{ border: "1px solid #eee", padding: 10, textAlign: "right" }}>{fmt(r.noShow)}</td>
                </tr>
              ))
            )}
          </tbody>
          {computed.rows.length > 0 && (
            <tfoot>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", background: "#fafafa" }}>
                  รวม
                </th>
                <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", background: "#fafafa" }}>
                  {fmt(computed.summary.total)}
                </th>
                <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", background: "#fafafa" }}>
                  {fmt(computed.summary.boarded)}
                </th>
                <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", background: "#fafafa" }}>
                  {fmt(computed.summary.canceled)}
                </th>
                <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", background: "#fafafa" }}>
                  {fmt(computed.summary.noShow)}
                </th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}