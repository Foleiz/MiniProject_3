import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "../css/ManageReport.css";
import { format } from "date-fns";

const API_BASE_URL = "http://localhost:3000";

export default function Report1() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      setError("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
      return;
    }
    setLoading(true);
    setError(null);
    setReportData([]);
    try {
      const url = `${API_BASE_URL}/reports1/passenger-stats?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายงานได้");
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartSeries = [
    {
      dataKey: "passengersOn",
      label: "ขึ้นรถ (คน)",
      valueFormatter: (value) => (value == null ? "0" : value.toLocaleString()),
    },
    {
      dataKey: "passengersOff",
      label: "ลงรถ (คน)",
      valueFormatter: (value) => (value == null ? "0" : value.toLocaleString()),
    },
  ];

  return (
    <div className="report-container">
      <h2>รายงานเปรียบเทียบจำนวนผู้โดยสารขึ้น-ลงรถ</h2>
      <div className="report-controls">
        <label>
          วันที่เริ่มต้น:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          วันที่สิ้นสุด:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={fetchReportData} disabled={loading}>
          {loading ? "กำลังโหลด..." : "ค้นหา"}
        </button>
      </div>

      {error && <div className="report-error">{error}</div>}

      {reportData.length > 0 && (
        <div className="report-content">
          <div className="chart-container">
            <BarChart
              dataset={reportData}
              xAxis={[{ scaleType: "band", dataKey: "date" }]}
              series={chartSeries}
              height={400}
              margin={{ top: 60, bottom: 30, left: 60, right: 20 }}
              slotProps={{
                legend: {
                  direction: "row",
                  position: { vertical: "top", horizontal: "middle" },
                  padding: 0,
                },
              }}
            />
          </div>
          <div className="report-tables-wrapper">
            <div className="table-container">
              <h4>ข้อมูลผู้โดยสารขึ้นรถ</h4>
              <table>
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>จำนวน (คน)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={`on-${index}`}>
                      <td>{row.date}</td>
                      <td>{row.passengersOn.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-container">
              <h4>ข้อมูลผู้โดยสารลงรถ</h4>
              <table>
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>จำนวน (คน)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={`off-${index}`}>
                      <td>{row.date}</td>
                      <td>{row.passengersOff.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
