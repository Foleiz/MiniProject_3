const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// POST /schedules
router.post("/", async (req, res) => {
  const { routeId, startDate, rounds } = req.body;
  try {
    const connection = await oracledb.getConnection();
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      const scheduleDateTime = `${startDate} ${round.time}`; // "YYYY-MM-DD HH24:MI"
      await connection.execute(
        `INSERT INTO SCHEDULE (ROUTEID, ROUND, SCHEDULEDATETIME, BUSID, DRIVERID)
         VALUES (:routeId, :round, TO_DATE(:scheduleDateTime, 'YYYY-MM-DD HH24:MI'), :busId, :driverId)`,
        {
          routeId,
          round: i + 1,
          scheduleDateTime,
          busId: round.carId,
          driverId: round.driverId
        }
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

// GET /schedules (ตัวอย่างสำหรับแสดงตาราง)
router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT ROUTEID, ROUND, TO_CHAR(SCHEDULEDATETIME, 'YYYY-MM-DD HH24:MI') AS SCHEDULEDATETIME, BUSID, DRIVERID FROM SCHEDULE`
    );
    const schedules = result.rows.map(row => ({
      routeId: row[0],
      round: row[1],
      scheduleDateTime: row[2],
      busId: row[3],
      driverId: row[4]
    }));
    res.json(schedules);
    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching schedules");
  }
});

// DELETE /schedules
router.delete("/", async (req, res) => {
  const { ids } = req.body;
  try {
    const connection = await oracledb.getConnection();
    for (const { routeId, round, scheduleDateTime } of ids) {
      // ใช้ routeId, round, scheduleDateTime ในการลบ
      await connection.execute(
        `DELETE FROM SCHEDULE WHERE ROUTEID = :routeId AND ROUND = :round AND SCHEDULEDATETIME = TO_DATE(:scheduleDateTime, 'YYYY-MM-DD HH24:MI')`,
        { routeId, round, scheduleDateTime }
      );
    }
    await connection.commit();
    res.json({ message: "ลบสำเร็จ" });
    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting schedules");
  }
});

module.exports = router;