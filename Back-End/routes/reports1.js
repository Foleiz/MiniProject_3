const express = require("express");
const oracledb = require("oracledb");

/**
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // GET /reports/passenger-stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  router.get("/passenger-stats", async (req, res) => {
    const { startDate, endDate } = req.query;
    let connection;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide both startDate and endDate." });
    }

    try {
      connection = await getConnection();
      const query = `
        SELECT
          TRUNC(SCHEDULEDATETIME) AS report_date,
          SUM(CASE WHEN CHECKINTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_on,
          SUM(CASE WHEN DROPOFFTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_off
        FROM RESERVATION
        WHERE TRUNC(SCHEDULEDATETIME) BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')
        GROUP BY TRUNC(SCHEDULEDATETIME)
        ORDER BY TRUNC(SCHEDULEDATETIME)
      `;

      const result = await connection.execute(
        query,
        { startDate, endDate },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const reportData = result.rows.map((row) => ({
        date: new Date(row.REPORT_DATE).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        passengersOn: row.TOTAL_PASSENGERS_ON,
        passengersOff: row.TOTAL_PASSENGERS_OFF,
      }));

      res.json(reportData);
    } catch (err) {
      console.error("Error fetching passenger stats report:", err);
      res.status(500).json({ error: "Failed to fetch report data" });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  });

  // GET /reports/passengers-by-route/:year
  router.get("/passengers-by-route/:year", async (req, res) => {
    const { year } = req.params;
    let connection;

    if (!/^\d{4}$/.test(year)) {
      return res
        .status(400)
        .json({ error: "Invalid year format. Please use YYYY." });
    }

    try {
      connection = await getConnection();
      // 1. Get all routes
      const routesResult = await connection.execute(
        `SELECT ROUTEID, ROUTENAME FROM ROUTES ORDER BY ROUTEID`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const routes = routesResult.rows.map((r) => ({
        id: r.ROUTEID,
        name: r.ROUTENAME,
      }));

      // 2. Get passenger stats grouped by month and route
      const statsQuery = `
      SELECT
        TO_CHAR(SCHEDULEDATETIME, 'MM') AS month_num,
        ROUTEID,
        SUM(CASE WHEN CHECKINTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers
      FROM RESERVATION
      WHERE TO_CHAR(SCHEDULEDATETIME, 'YYYY') = :year
      GROUP BY TO_CHAR(SCHEDULEDATETIME, 'MM'), ROUTEID
      ORDER BY month_num, ROUTEID
    `;

      const statsResult = await connection.execute(
        statsQuery,
        { year },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // 3. Format data for the chart
      const monthNames = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];

      const dataset = monthNames.map((name, index) => {
        const monthNum = String(index + 1).padStart(2, "0");
        const monthData = { month: name };
        routes.forEach((route) => {
          const stat = statsResult.rows.find(
            (r) => r.MONTH_NUM === monthNum && r.ROUTEID === route.id
          );
          monthData[route.id] = stat ? stat.TOTAL_PASSENGERS : 0;
        });
        return monthData;
      });

      res.json({
        routes,
        dataset,
      });
    } catch (err) {
      console.error("Error fetching passengers by route report:", err);
      res.status(500).json({ error: "Failed to fetch report data" });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  });
  return router;
};
