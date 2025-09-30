import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);
const API_BASE_URL = "http://localhost:3000";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Report3 = () => {
  const [startDate, setStartDate] = useState(null); // Date object
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
      // format date to query string
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

      {/* DatePickers */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Start Date:{" "}
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select start date"
          />
        </label>{" "}
        <label>
          End Date:{" "}
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select end date"
          />
        </label>{" "}
        <button onClick={fetchReport}>Generate Report</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {reportData && (
        <div>
          {/* Per Bus table */}
          <h3>Jobs per Bus</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
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

          {/* Pie Chart for jobs per bus type */}
          <h3 style={{ marginTop: "2rem" }}> Jobs per Bus Type</h3>
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

          {/* Per Type table */}

          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
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