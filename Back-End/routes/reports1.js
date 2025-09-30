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
    TRUNC(SCHEDULEDATE) AS report_date,
    SUM(CASE WHEN CHECKINTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_on,
    SUM(CASE WHEN DROPOFFTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_off
  FROM RESERVATION
  WHERE TRUNC(SCHEDULEDATE) BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')
  GROUP BY TRUNC(SCHEDULEDATE)
  ORDER BY TRUNC(SCHEDULEDATE)
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

  // GET /reports1/passengers-by-route-daily?startDate=...&endDate=...
  router.get("/passengers-by-route-daily", async (req, res) => {
    const { startDate, endDate } = req.query;
    let connection;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Please provide both startDate and endDate." });
    }

    try {
      connection = await getConnection();

      // 1. Get all stops that have data in the date range
      const stopsQuery = `
      SELECT DISTINCT s.STOPID, s.STOPNAME
      FROM STOP s
      JOIN ROUTE_STOP rs ON s.STOPID = rs.STOPID
      JOIN RESERVATION reserv ON rs.ROUTEID = reserv.ROUTEID AND (rs.STOPORDER = reserv.PICKUPSTOPORDER OR rs.STOPORDER = reserv.DROPOFFSTOPORDER)
      WHERE TRUNC(reserv.SCHEDULEDATE) BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')
      ORDER BY s.STOPID
    `;
      const stopsResult = await connection.execute(
        stopsQuery,
        { startDate, endDate },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const stops = stopsResult.rows.map((s) => ({
        id: s.STOPID,
        name: s.STOPNAME,
      }));

      if (stops.length === 0) {
        return res.json({ stops: [], dataset: [] });
      }

      // 2. Get passenger stats grouped by day and stop
      const statsQuery = `
  SELECT
    TRUNC(SCHEDULEDATE) AS report_date,
    ROUTEID, -- Keep for mapping
    PICKUPSTOPORDER,
    DROPOFFSTOPORDER,
    SUM(CASE WHEN CHECKINTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_on,
    SUM(CASE WHEN DROPOFFTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_off
  FROM RESERVATION
  WHERE TRUNC(SCHEDULEDATE) BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD') AND (PICKUPSTOPORDER IS NOT NULL OR DROPOFFSTOPORDER IS NOT NULL)
  GROUP BY TRUNC(SCHEDULEDATE), ROUTEID, PICKUPSTOPORDER, DROPOFFSTOPORDER
  ORDER BY report_date
`; // We will aggregate stops in the next step

      const statsResult = await connection.execute(
        statsQuery,
        { startDate, endDate },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // 3. Format data for the chart dataset, aggregating by stop
      const datasetMap = new Map();
      const stopOrderToIdMap = new Map(); // Cache for ROUTE_STOP lookups

      // Pre-fetch all route_stop mappings to avoid querying in a loop
      const routeStopResult = await connection.execute(
        `SELECT ROUTEID, STOPORDER, STOPID FROM ROUTE_STOP`
      );
      routeStopResult.rows.forEach((row) => {
        const [routeId, stopOrder, stopId] = row;
        stopOrderToIdMap.set(`${routeId}-${stopOrder}`, stopId);
      });

      statsResult.rows.forEach((row) => {
        const dateStr = new Date(row.REPORT_DATE).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        if (!datasetMap.has(dateStr)) {
          const newDayData = { date: dateStr };
          stops.forEach((stop) => {
            newDayData[`${stop.id}_on`] = 0;
            newDayData[`${stop.id}_off`] = 0;
          });
          datasetMap.set(dateStr, newDayData);
        }

        const dayData = datasetMap.get(dateStr);

        // Aggregate 'on' passengers
        if (row.PICKUPSTOPORDER !== null && row.TOTAL_PASSENGERS_ON > 0) {
          const stopId = stopOrderToIdMap.get(
            `${row.ROUTEID}-${row.PICKUPSTOPORDER}`
          );
          if (stopId && dayData.hasOwnProperty(`${stopId}_on`)) {
            dayData[`${stopId}_on`] += row.TOTAL_PASSENGERS_ON;
          }
        }
        // Aggregate 'off' passengers
        if (row.DROPOFFSTOPORDER !== null && row.TOTAL_PASSENGERS_OFF > 0) {
          const stopId = stopOrderToIdMap.get(
            `${row.ROUTEID}-${row.DROPOFFSTOPORDER}`
          );
          if (stopId && dayData.hasOwnProperty(`${stopId}_off`)) {
            dayData[`${stopId}_off`] += row.TOTAL_PASSENGERS_OFF;
          }
        }
      });

      res.json({ routes: stops, dataset: Array.from(datasetMap.values()) }); // Rename 'stops' to 'routes' for frontend compatibility
    } catch (err) {
      console.error("Error fetching passengers by route (daily) report:", err);
      res.status(500).json({ error: "Failed to fetch chart data" });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (e) {
          console.error("Error closing connection:", e);
        }
      }
    }
  });

  // GET /reports1/passengers-by-route/:year
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

      const stopsResult = await connection.execute(
        `SELECT STOPID, STOPNAME FROM "STOP" ORDER BY STOPID`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const stops = stopsResult.rows.map((s) => ({
        id: s.STOPID,
        name: s.STOPNAME,
      }));

      const statsQuery = `
      SELECT
        TO_CHAR(SCHEDULEDATE, 'MM') AS month_num,
        PICKUPSTOPORDER,
        DROPOFFSTOPORDER,
        ROUTEID, -- Keep for mapping
        SUM(CASE WHEN CHECKINTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_on,
        SUM(CASE WHEN DROPOFFTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_off
      FROM RESERVATION
      WHERE TO_CHAR(SCHEDULEDATE, 'YYYY') = :year
      GROUP BY TO_CHAR(SCHEDULEDATE, 'MM'), PICKUPSTOPORDER, DROPOFFSTOPORDER, ROUTEID
      ORDER BY month_num
    `;

      const statsResult = await connection.execute(
        statsQuery,
        { year },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Pre-fetch all route_stop mappings
      const routeStopResult = await connection.execute(
        `SELECT ROUTEID, STOPORDER, STOPID FROM ROUTE_STOP`
      );
      const stopOrderToIdMap = new Map();
      routeStopResult.rows.forEach((row) => {
        const [routeId, stopOrder, stopId] = row;
        stopOrderToIdMap.set(`${routeId}-${stopOrder}`, stopId);
      });

      const dataset = [...Array(12).keys()].map((i) => {
        const monthNum = String(i + 1).padStart(2, "0");
        const monthData = { month: monthNum };
        stops.forEach((stop) => {
          monthData[`${stop.id}_on`] = 0;
          monthData[`${stop.id}_off`] = 0;
        });

        statsResult.rows
          .filter((r) => r.MONTH_NUM === monthNum)
          .forEach((stat) => {
            const onStopId = stopOrderToIdMap.get(
              `${stat.ROUTEID}-${stat.PICKUPSTOPORDER}`
            );
            if (onStopId && monthData.hasOwnProperty(`${onStopId}_on`)) {
              monthData[`${onStopId}_on`] += stat.TOTAL_PASSENGERS_ON;
            }
            const offStopId = stopOrderToIdMap.get(
              `${stat.ROUTEID}-${stat.DROPOFFSTOPORDER}`
            );
            if (offStopId && monthData.hasOwnProperty(`${offStopId}_off`)) {
              monthData[`${offStopId}_off`] += stat.TOTAL_PASSENGERS_OFF;
            }
          });
        return monthData;
      });

      res.json({ routes: stops, dataset }); // Rename 'stops' to 'routes' for frontend compatibility
    } catch (err) {
      console.error("Error fetching passengers by route report:", err);
      res.status(500).json({ error: "Failed to fetch report data" });
    } finally {
      if (connection) await connection.close();
    }
  });

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

  // GET /reports1/passenger-stats-monthly/:year
  router.get("/passenger-stats-monthly/:year", async (req, res) => {
    const { year } = req.params;
    let connection;

    if (!/^\d{4}$/.test(year)) {
      return res
        .status(400)
        .json({ error: "Invalid year format. Please use YYYY." });
    }

    try {
      connection = await getConnection();
      const query = `
      SELECT
        TO_CHAR(SCHEDULEDATE, 'YYYY-MM') AS report_month,
        SUM(CASE WHEN CHECKINTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_on,
        SUM(CASE WHEN DROPOFFTIME IS NOT NULL THEN PASSENGERCOUNT ELSE 0 END) AS total_passengers_off
      FROM RESERVATION
      WHERE TO_CHAR(SCHEDULEDATE, 'YYYY') = :year
      GROUP BY TO_CHAR(SCHEDULEDATE, 'YYYY-MM')
      ORDER BY report_month
    `;

      const result = await connection.execute(
        query,
        { year },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const reportData = result.rows.map((row) => ({
        date: row.REPORT_MONTH,
        passengersOn: row.TOTAL_PASSENGERS_ON,
        passengersOff: row.TOTAL_PASSENGERS_OFF,
      }));

      res.json(reportData);
    } catch (err) {
      console.error("Error fetching monthly passenger stats report:", err);
      res.status(500).json({ error: "Failed to fetch report data" });
    } finally {
      if (connection) await connection.close();
    }
  });

  return router;
};
