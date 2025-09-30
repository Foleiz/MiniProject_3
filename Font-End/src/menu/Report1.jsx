import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "../css/ManageReport.css";
import { format } from "date-fns";

const API_BASE_URL = "http://localhost:3000";

export default function Report1() {
  const today = new Date();
  const [reportType, setReportType] = useState("daily"); // 'daily' or 'monthly'
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState({ routes: [], dataset: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    if (reportType === "daily" && (!startDate || !endDate)) {
      setError("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุดสำหรับรายงานรายวัน");
      return;
    }
    setLoading(true);
    setError(null);
    setReportData([]);
    setChartData({ routes: [], dataset: [] });

    try {
      let tableUrl, chartUrl;

      if (reportType === "daily") {
        tableUrl = `${API_BASE_URL}/reports1/passenger-stats?startDate=${startDate}&endDate=${endDate}`;
        chartUrl = `${API_BASE_URL}/reports1/passengers-by-route-daily?startDate=${startDate}&endDate=${endDate}`;
      } else {
        // เพิ่มการดึงข้อมูลสำหรับตารางรายเดือน
        tableUrl = `${API_BASE_URL}/reports1/passenger-stats-monthly/${selectedYear}`;
        chartUrl = `${API_BASE_URL}/reports1/passengers-by-route/${selectedYear}`;
      }

      const fetchPromises = [chartUrl && fetch(chartUrl)].filter(Boolean);
      if (tableUrl) {
        fetchPromises.unshift(fetch(tableUrl));
      }

      const responses = await Promise.all(fetchPromises);

      const chartResponse = tableUrl ? responses[1] : responses[0];
      const tableResponse = tableUrl ? responses[0] : null;

      if ((tableResponse && !tableResponse.ok) || !chartResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายงานได้");
      }
      const tableData = tableResponse ? await tableResponse.json() : [];
      const newChartData = await chartResponse.json();
      setReportData(tableData);
      setChartData(newChartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ดึงข้อมูลอัตโนมัติเมื่อเปลี่ยนประเภทรายงาน (รายวัน/รายเดือน)
    // หรือเมื่อเปิดหน้าครั้งแรก
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]); // การเปลี่ยนวันที่หรือปี จะต้องกด "ค้นหา" เอง

  const chartSeries = chartData.routes.map((route) => ({
    dataKey: String(route.id),
    label: route.name,
    valueFormatter: (value) => (value == null ? "0" : value.toLocaleString()),
  }));

  return (
    <div className="report-container">
      <h2>รายงานเปรียบเทียบจำนวนผู้โดยสารขึ้น-ลงรถ</h2>
      <div className="report-controls glass-card">
        <div className="report-type-selector">
          <label>
            <input
              type="radio"
              name="reportType"
              value="daily"
              checked={reportType === "daily"}
              onChange={() => setReportType("daily")}
            />
            รายวัน
          </label>
          <label>
            <input
              type="radio"
              name="reportType"
              value="monthly"
              checked={reportType === "monthly"}
              onChange={() => setReportType("monthly")}
            />
            รายเดือน
          </label>
        </div>
        {reportType === "daily" ? (
          <>
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
          </>
        ) : (
          <label>
            เลือกปี:
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            />
          </label>
        )}

        <button
          className="search-button"
          onClick={() => fetchReportData()}
          disabled={loading}
        >
          {loading ? "กำลังโหลด..." : "ค้นหา"}
        </button>
      </div>

      {error && <div className="report-error">{error}</div>}

      {loading ? (
        <div className="loading-message">กำลังโหลดข้อมูล...</div>
      ) : !error &&
        reportData.length === 0 &&
        chartData.dataset.length === 0 ? (
        <div className="no-data-message">ไม่พบข้อมูลสำหรับช่วงที่เลือก</div>
      ) : (
        <div className="report-content glass-card">
          <div className="chart-container">
            <BarChart
              dataset={chartData.dataset}
              xAxis={[
                {
                  scaleType: "band",
                  dataKey: reportType === "daily" ? "date" : "month",
                  tickLabelStyle: {
                    angle: -45,
                    textAnchor: "end",
                    fontSize: 12,
                  },
                  valueFormatter: (value) => value, // ✅ ใช้ค่าที่ได้มาโดยตรง
                },
              ]}
              series={chartSeries}
              height={400}
              margin={{ top: 60, bottom: 50, left: 60, right: 20 }} // ✅ เพิ่มระยะด้านล่างให้ชื่อไม่ชน
              slotProps={{
                legend: {
                  direction: "row",
                  position: { vertical: "top", horizontal: "middle" },
                  padding: 0,
                },
              }}
            />
          </div>
          {reportData.length > 0 && (
            <div className="table-container">
              <h4>ตารางสรุปข้อมูล</h4>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>{reportType === "daily" ? "วันที่" : "เดือน"}</th>
                    <th>ผู้โดยสารขึ้น (คน)</th>
                    <th>ผู้โดยสารลง (คน)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.date}</td>
                      <td>{row.passengersOn.toLocaleString()}</td>
                      <td>{row.passengersOff.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
