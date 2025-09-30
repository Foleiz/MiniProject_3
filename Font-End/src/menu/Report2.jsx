import React, { useMemo, useRef, useState } from "react";

import "../css/ManageReport.css"; // Import shared report styles
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { th } from "date-fns/locale";
import { TextField } from "@mui/material";

// ใช้ .env: VITE_API_BASE_URL=http://localhost:3000
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const formatDateForAPI = (date) =>
  date ? date.toISOString().split("T")[0] : "";

export default function Report2() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const fetchReport = async () => {
    setError("");
    if (!startDate || !endDate)
      return setError("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
    if (endDate < startDate)
      return setError("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น");

    // ยกเลิกรีเควสต์ก่อนหน้า ถ้ามี
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);
    try {
      const url = `${API_BASE_URL}/report2?start=${formattedStartDate}&end=${formattedEndDate}`;
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
    setStartDate(null);
    setEndDate(null);
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

  return (
    <div className="report-container">
      <h2>รายงานพฤติกรรมของผู้ใช้</h2>

      <div className="report-controls glass-card">
        <div className="report-filters">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
            <DatePicker
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => (
                  <TextField
                    {...params}
                    size="small"
                    onKeyDown={(e) => e.key === "Enter" && fetchReport()}
                  />
                ),
              }}
            />
            <DatePicker
              label="วันที่สิ้นสุด"
              value={endDate}
              minDate={startDate}
              onChange={(newValue) => setEndDate(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => (
                  <TextField
                    {...params}
                    size="small"
                    onKeyDown={(e) => e.key === "Enter" && fetchReport()}
                  />
                ),
              }}
            />
          </LocalizationProvider>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={clearReport}
            disabled={loading || computed.rows.length === 0}
            className="secondary-button btn-clear"
          >
            ล้างผลลัพธ์
          </button>

          <button
            onClick={resetDates}
            disabled={loading}
            className="secondary-button btn-reset"
          >
            รีเซ็ตวันที่
          </button>

          <button
            onClick={fetchReport}
            disabled={!startDate || !endDate || loading}
            className="search-button"
          >
            {loading ? "กำลังดึงข้อมูล..." : "ดึงรายงาน"}
          </button>
        </div>
      </div>

      {error && <div className="report-error">{error}</div>}

      {loading ? (
        <div className="loading-message">กำลังโหลด...</div>
      ) : rows.length === 0 && !error ? (
        <div className="no-data-message">
          {computed.rows.length > 0 ? (
            <>
              ช่วงวันที่{" "}
              <strong>{startDate.toLocaleDateString("th-TH")}</strong> ถึง{" "}
              <strong>{endDate.toLocaleDateString("th-TH")}</strong> · ผู้ใช้{" "}
              <strong>{computed.countUsers}</strong> คน · รวมการจอง{" "}
              <strong>{fmt(computed.summary.total)}</strong>
            </>
          ) : (
            "เลือกช่วงวันที่แล้วกด 'ดึงรายงาน'"
          )}
        </div>
      ) : (
        <div className="report-content glass-card">
          <div className="table-container">
            <h4>
              สรุปพฤติกรรมผู้ใช้ ช่วงวันที่{" "}
              <strong>{startDate.toLocaleDateString("th-TH")}</strong> ถึง{" "}
              <strong>{endDate.toLocaleDateString("th-TH")}</strong>
            </h4>
            <table className="report-table">
              <thead>
                <tr>
                  {[
                    "ผู้ใช้",
                    "การจองทั้งหมด",
                    "ขึ้นรถจริง",
                    "ยกเลิก",
                    "ไม่ขึ้นรถ",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {computed.rows.map((r) => (
                  <tr key={r.userId}>
                    <td style={{ textAlign: "left" }}>{r.userName}</td>
                    <td>{fmt(r.total)}</td>
                    <td>{fmt(r.boarded)}</td>
                    <td>{fmt(r.canceled)}</td>
                    <td>{fmt(r.noShow)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <th>รวม</th>
                  <th>{fmt(computed.summary.total)}</th>
                  <th>{fmt(computed.summary.boarded)}</th>
                  <th>{fmt(computed.summary.canceled)}</th>
                  <th>{fmt(computed.summary.noShow)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
