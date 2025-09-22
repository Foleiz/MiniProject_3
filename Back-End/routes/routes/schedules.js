const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// POST /schedules
router.post("/", async (req, res) => {
  const { routeId, startDate, endDate, rounds } = req.body;
  try {
    const connection = await oracledb.getConnection();

    // ตัวอย่าง: insert ตาราง SCHEDULE (คุณต้องสร้างตารางนี้ใน Oracle ก่อน)
    const result = await connection.execute(
      `INSERT INTO SCHEDULE (ROUTEID, STARTDATE, ENDDATE) VALUES (:routeId, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD')) RETURNING SCHEDULEID INTO :scheduleId`,
      { routeId, startDate, endDate, scheduleId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
      { autoCommit: false }
    );
    const scheduleId = result.outBinds.scheduleId[0];

    // Insert รอบแต่ละรอบ (ตัวอย่าง: ตาราง SCHEDULE_ROUND)
    for (const round of rounds) {
      await connection.execute(
        `INSERT INTO SCHEDULE_ROUND (SCHEDULEID, TIME, DRIVERID, CARID) VALUES (:scheduleId, :time, :driverId, :carId)`,
        { scheduleId, time: round.time, driverId: round.driverId, carId: round.carId }
      );
    }

    await connection.commit();
    res.status(201).json({ message: "บันทึกตารางสำเร็จ" });
    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving schedule");
  }
});

module.exports = router;