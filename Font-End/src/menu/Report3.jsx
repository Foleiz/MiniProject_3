import React, { useState } from "react";
import "../css/ManageReport.css"; // Import shared report styles
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { th } from "date-fns/locale";
import { TextField } from "@mui/material";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const API_BASE_URL = "http://localhost:3000";

const Report3 = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const startYear = startDate.getFullYear();
      const startMonth = String(startDate.getMonth() + 1).padStart(2, "0");
      const startDay = String(startDate.getDate()).padStart(2, "0");
      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, "0");
      const endDay = String(endDate.getDate()).padStart(2, "0");

      const url =
        `${API_BASE_URL}/report3?startYear=${startYear}&startMonth=${startMonth}&startDay=${startDay}` +
        `&endYear=${endYear}&endMonth=${endMonth}&endDay=${endDay}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch report data");
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching report data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2>รายงานข้อมูลการใช้งานรถ</h2>

      <div className="report-controls glass-card">
        <div className="report-filters">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
            <DatePicker
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => <TextField {...params} size="small" />,
              }}
            />
            <DatePicker
              label="วันที่สิ้นสุด"
              value={endDate}
              minDate={startDate}
              onChange={(newValue) => setEndDate(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => <TextField {...params} size="small" />,
              }}
            />
          </LocalizationProvider>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="search-button"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? "กำลังโหลด..." : "ค้นหา"}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setReportData(null);
              setStartDate(null);
              setEndDate(null);
              setError("");
            }}
            disabled={loading}
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      {error && <div className="report-error">{error}</div>}

      {loading ? (
        <div className="loading-message">กำลังโหลดข้อมูล...</div>
      ) : !reportData ? (
        <div className="no-data-message">กรุณาเลือกช่วงวันที่และกดค้นหา</div>
      ) : (
        <div className="report-content glass-card">
          <div className="charts-grid">
            <div className="table-container">
              <h4>จำนวนการใช้งานรถแต่ละคัน</h4>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ประเภทรถ</th>
                    <th>เลขทะเบียน</th>
                    <th>จำนวนการใช้งาน (ครั้ง)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.perBus.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.BusType}</td>
                      <td>{row.PlateNumber}</td>
                      <td>{row.TotalJobs.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="chart-container">
              <h4>สัดส่วนการใช้งานรถแต่ละประเภท</h4>
              <div style={{ maxWidth: 400, margin: "0 auto" }}>
                <Pie
                  data={{
                    labels: reportData.perType.map((row) => row.BusType),
                    datasets: [
                      {
                        data: reportData.perType.map((row) => row.TotalJobs),
                        backgroundColor: [
                          "#4caf50",
                          "#2196f3",
                          "#ff9800",
                          "#e91e63",
                          "#9c27b0",
                          "#00bcd4",
                          "#ffc107",
                        ],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { position: "bottom" },
                      datalabels: {
                        formatter: (value, context) => {
                          const dataArr = context.chart.data.datasets[0].data;
                          const total = dataArr.reduce((a, b) => a + b, 0);
                          const percent = total
                            ? ((value / total) * 100).toFixed(1)
                            : 0;
                          return `${percent}%`;
                        },
                        color: "#fff",
                        font: { weight: "bold", size: 14 },
                        textShadow: {
                          color: "rgba(0, 0, 0, 0.5)",
                          blur: 4,
                          offsetX: 1,
                          offsetY: 1,
                        },
                      },
                      tooltip: {
                        enabled: true,
                        callbacks: {
                          label: function (context) {
                            const label = context.label || "";
                            const value = context.parsed;
                            const dataArr = context.chart.data.datasets[0].data;
                            const total = dataArr.reduce((a, b) => a + b, 0);
                            const percent = total
                              ? ((value / total) * 100).toFixed(1)
                              : 0;
                            return `${label}: ${value.toLocaleString()} ครั้ง (${percent}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report3;
