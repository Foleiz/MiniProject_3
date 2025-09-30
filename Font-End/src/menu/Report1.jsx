import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "../css/ManageReport.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const API_BASE_URL = "http://localhost:3000";

export default function Report1() {
  const today = new Date();
  const [reportType, setReportType] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState({ routes: [], dataset: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ ฟังก์ชันแปลงเลขเดือน → ชื่อย่อภาษาไทย
  const formatMonthLabel = (monthNumber) => {
    const monthsThai = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    const index = parseInt(monthNumber, 10) - 1;
    return monthsThai[index] || monthNumber;
  };

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
        tableUrl = `${API_BASE_URL}/reports1/passenger-stats-monthly/${selectedYear}`;
        chartUrl = `${API_BASE_URL}/reports1/passengers-by-route/${selectedYear}`;
      }

      const responses = await Promise.all([fetch(tableUrl), fetch(chartUrl)]);
      if (!responses[0].ok || !responses[1].ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายงานได้");
      }

      const tableData = await responses[0].json();
      const newChartData = await responses[1].json();

      setReportData(tableData);
      setChartData(newChartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const chartSeriesOn = (chartData.routes || []).map((route) => ({
    dataKey: `${route.id}_on`,
    label: route.name,
    valueFormatter: (v) => (v == null ? "0" : v.toLocaleString()),
  }));

  const chartSeriesOff = (chartData.routes || []).map((route) => ({
    dataKey: `${route.id}_off`,
    label: route.name,
    valueFormatter: (v) => (v == null ? "0" : v.toLocaleString()),
    showInLegend: false,
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

        <div className="report-filters">
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
        </div>

        <button
          className="search-button"
          onClick={fetchReportData}
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
          <div className="charts-grid">
            <div className="chart-container">
              <h4>จำนวนผู้โดยสารขึ้น</h4>
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
                    valueFormatter: (value) =>
                      reportType === "daily" ? value : formatMonthLabel(value),
                  },
                ]}
                series={chartSeriesOn}
                height={400}
                margin={{ top: 80, bottom: 60, left: 60, right: 20 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "top", horizontal: "middle" },
                    padding: 0,
                  },
                }}
              />
            </div>

            <div className="chart-container">
              <h4>จำนวนผู้โดยสารลง</h4>
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
                    valueFormatter: (value) =>
                      reportType === "daily" ? value : formatMonthLabel(value),
                  },
                ]}
                series={chartSeriesOff}
                height={400}
                margin={{ top: 80, bottom: 60, left: 60, right: 20 }}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
            </div>
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
                      <td>
                        {reportType === "daily"
                          ? row.date
                          : format(
                              new Date(row.date + "T12:00:00"),
                              "LLLL yyyy",
                              {
                                locale: th,
                              }
                            )}
                      </td>
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
