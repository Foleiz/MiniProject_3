import React, { useState } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, Button } from "@mui/material";

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

      const url = `${API_BASE_URL}/report3?startYear=${startYear}&startMonth=${startMonth}&startDay=${startDay}` +
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
    <div>
      <h2>Report 3: Bus Jobs Report</h2>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <Button variant="contained" onClick={fetchReport}>
            Generate Report
          </Button>
        </div>
      </LocalizationProvider>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {reportData && (
        <div>
          {/* Per Bus Table */}
          <h3>Jobs per Bus</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Bus Type</th>
                <th>Plate Number</th>
                <th>Total Jobs</th>
              </tr>
            </thead>
            <tbody>
              {reportData.perBus.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.BusType}</td>
                  <td>{row.PlateNumber}</td>
                  <td>{row.TotalJobs}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pie Chart */}
          <h3 style={{ marginTop: "2rem" }}>Jobs per Bus Type</h3>
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <Pie
              data={{
                labels: reportData.perType.map(row => row.BusType),
                datasets: [
                  {
                    data: reportData.perType.map(row => row.TotalJobs),
                    backgroundColor: [
                      '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#ffc107'
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { position: 'bottom' },
                  datalabels: {
                    formatter: (value, context) => {
                      const dataArr = context.chart.data.datasets[0].data;
                      const total = dataArr.reduce((a, b) => a + b, 0);
                      const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                      return percent + '%';
                    },
                    color: '#333',
                    font: { weight: 'bold', size: 14 }
                  },
                  tooltip: {
                    enabled: true,
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const dataArr = context.chart.data.datasets[0].data;
                        const total = dataArr.reduce((a, b) => a + b, 0);
                        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} jobs (${percent}%)`;
                      }
                    }
                  },
                },
              }}
            />
          </div>

          {/* Per Type Table */}
          <h3 style={{ marginTop: "2rem" }}>Jobs per Bus Type Table</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Bus Type</th>
                <th>Total Jobs</th>
              </tr>
            </thead>
            <tbody>
              {reportData.perType.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.BusType}</td>
                  <td>{row.TotalJobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Report3;
