import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { th } from "date-fns/locale";
import { TextField } from "@mui/material";

const API_BASE_URL = "http://localhost:3000";

const MONTHS = [
  { key: "JAN", name: "ม.ค." },
  { key: "FEB", name: "ก.พ." },
  { key: "MAR", name: "มี.ค." },
  { key: "APR", name: "เม.ย." },
  { key: "MAY", name: "พ.ค." },
  { key: "JUN", name: "มิ.ย." },
  { key: "JUL", name: "ก.ค." },
  { key: "AUG", name: "ส.ค." },
  { key: "SEP", name: "ก.ย." },
  { key: "OCT", name: "ต.ค." },
  { key: "NOV", name: "พ.ย." },
  { key: "DEC", name: "ธ.ค." },
];

const MONTHS_THAI = [
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

export default function Report1() {
  const today = new Date();
  const formatDateForAPI = (date) => date.toISOString().split("T")[0];
  const [reportType, setReportType] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState({ routes: [], dataset: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatMonthLabel = (monthNumber) =>
    MONTHS_THAI[parseInt(monthNumber, 10) - 1] || monthNumber;

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
      const isDaily = reportType === "daily";
      const dateParams = isDaily
        ? `?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(
            endDate
          )}`
        : `/${selectedYear}`;

      const [tableRes, chartRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/reports1/${
            isDaily
              ? "passenger-stats" + dateParams
              : "passenger-stats-by-stop-monthly" + dateParams
          }`
        ),
        fetch(
          `${API_BASE_URL}/reports1/passengers-by-route${
            isDaily ? "-daily" + dateParams : dateParams
          }`
        ),
      ]);

      if (!tableRes.ok || !chartRes.ok)
        throw new Error("ไม่สามารถดึงข้อมูลรายงานได้");

      setReportData(await tableRes.json());
      setChartData(await chartRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const createChartSeries = (type) =>
    (chartData.routes || []).map((route) => ({
      dataKey: `${route.id}_${type}`,
      label: route.name,
      valueFormatter: (v) => (v == null ? "0" : v.toLocaleString()),
    }));

  const renderChart = (title, type) => (
    <div className="chart-container">
      <h4>{title}</h4>
      <BarChart
        dataset={chartData.dataset}
        xAxis={[
          {
            scaleType: "band",
            dataKey: reportType === "daily" ? "date" : "month",
            tickLabelStyle: { angle: -45, textAnchor: "end", fontSize: 12 },
            valueFormatter: (value) =>
              reportType === "daily" ? value : formatMonthLabel(value),
          },
        ]}
        series={createChartSeries(type)}
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
  );

  const calculateMonthlyTotals = () => {
    const totals = { grandTotalOn: 0, grandTotalOff: 0 };
    MONTHS.forEach((m) => {
      totals[`${m.key}_ON`] = 0;
      totals[`${m.key}_OFF`] = 0;
    });
    reportData.forEach((row) => {
      MONTHS.forEach((m) => {
        totals[`${m.key}_ON`] += row[`${m.key}_ON`] || 0;
        totals[`${m.key}_OFF`] += row[`${m.key}_OFF`] || 0;
      });
      totals.grandTotalOn += row.TOTAL_ON || 0;
      totals.grandTotalOff += row.TOTAL_OFF || 0;
    });
    return totals;
  };

  return (
    <div className="report-container">
      <h2>รายงานเปรียบเทียบจำนวนผู้โดยสารขึ้น-ลงรถ</h2>

      <div className="report-controls glass-card">
        <div className="report-type-selector">
          {["daily", "monthly"].map((type) => (
            <label key={type} className={`report-type-${type}`}>
              <input
                type="radio"
                name="reportType"
                value={type}
                checked={reportType === type}
                onChange={() => setReportType(type)}
              />
              {type === "daily" ? "รายวัน" : "รายเดือน"}
            </label>
          ))}
        </div>

        <div className="report-filters">
          {reportType === "daily" ? (
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={th}
            >
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
                onChange={(newValue) => setEndDate(newValue)}
                enableAccessibleFieldDOMStructure={false}
                slots={{
                  textField: (params) => <TextField {...params} size="small" />,
                }}
              />
            </LocalizationProvider>
          ) : (
            <label>
              เลือกปี:{" "}
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
            {renderChart("จำนวนผู้โดยสารขึ้น", "on")}
            {renderChart("จำนวนผู้โดยสารลง", "off")}
          </div>

          {reportData.length > 0 && (
            <div className="table-container">
              <h4>ตารางสรุปข้อมูล</h4>
              <table className="report-table">
                <thead
                  className={
                    reportType === "daily" ? "daily-header" : "monthly-header"
                  }
                >
                  <tr>
                    {reportType === "daily" ? (
                      <>
                        <th>วันที่</th>
                        <th>ผู้โดยสารขึ้น (คน)</th>
                        <th>ผู้โดยสารลง (คน)</th>
                      </>
                    ) : (
                      <>
                        <th>จุดจอด</th>
                        {MONTHS.map((m) => (
                          <th key={m.key}>{m.name}</th>
                        ))}
                        <th>รวมปี (ขึ้น)</th>
                        <th>รวมปี (ลง)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportType === "daily" ? (
                    reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td>{(row.passengersOn || 0).toLocaleString()}</td>
                        <td>{(row.passengersOff || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      {reportData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.STOPNAME}</td>
                          {MONTHS.map((m) => (
                            <td key={m.key}>{`${row[`${m.key}_ON`] || 0} / ${
                              row[`${m.key}_OFF`] || 0
                            }`}</td>
                          ))}
                          <td>{(row.TOTAL_ON || 0).toLocaleString()}</td>
                          <td>{(row.TOTAL_OFF || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      {(() => {
                        const totals = calculateMonthlyTotals();
                        return (
                          <tr className="total-row">
                            <td>รวมทั้งหมด</td>
                            {MONTHS.map((m) => (
                              <td key={`total-${m.key}`}>
                                {`${(
                                  totals[`${m.key}_ON`] || 0
                                ).toLocaleString()} / ${(
                                  totals[`${m.key}_OFF`] || 0
                                ).toLocaleString()}`}
                              </td>
                            ))}
                            <td>{totals.grandTotalOn.toLocaleString()}</td>
                            <td>{totals.grandTotalOff.toLocaleString()}</td>
                          </tr>
                        );
                      })()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
