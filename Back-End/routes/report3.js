const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Report3: Jobs per bus and per bus type within date range
router.get("/", async (req, res) => {
  const execute = req.app.locals.execute;

  try {
    const { startYear, startMonth, startDay, endYear, endMonth, endDay } = req.query;

    if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
      return res.status(400).json({ error: "Missing required date parameters" });
    }

    const startDate = `${startDay}-${startMonth}-${startYear}`;
    const endDate = `${endDay}-${endMonth}-${endYear}`;

    // Query 1: Per bus
    const sqlPerBus = `
      SELECT
          bt.TypeName AS "BusType",
          b.PlateNumber AS "PlateNumber",
          COUNT(s.RouteID) AS "TotalJobs"
      FROM
          BUS b
      JOIN
          BUSTYPE bt ON b.BusTypeID = bt.BusTypeID
      LEFT JOIN
          SCHEDULE s
          ON s.BusID = b.BusID
         AND s.ScheduleDate BETWEEN TO_DATE(:startDate, 'DD-MM-YYYY')
                                AND TO_DATE(:endDate, 'DD-MM-YYYY')
      GROUP BY
          bt.TypeName, b.PlateNumber
      ORDER BY
          bt.TypeName, b.PlateNumber
    `;

    // Query 2: Per bus type (grand total)
    const sqlPerType = `
      SELECT
          bt.TypeName AS "BusType",
          COUNT(*) AS "TotalJobs"
      FROM
          SCHEDULE s
      JOIN
          BUS b ON s.BusID = b.BusID
      JOIN
          BUSTYPE bt ON b.BusTypeID = bt.BusTypeID
      WHERE
          s.ScheduleDate BETWEEN TO_DATE(:startDate, 'DD-MM-YYYY')
                             AND TO_DATE(:endDate, 'DD-MM-YYYY')
      GROUP BY
          bt.TypeName
      ORDER BY
          bt.TypeName
    `;

    const [perBusResult, perTypeResult] = await Promise.all([
      execute(sqlPerBus, { startDate, endDate }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      execute(sqlPerType, { startDate, endDate }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    ]);

    res.json({
      perBus: perBusResult.rows,
      perType: perTypeResult.rows
    });
  } catch (err) {
    console.error("Error fetching report3:", err);
    res.status(500).json({ error: "Failed to fetch report3 data" });
  }
});

module.exports = router;