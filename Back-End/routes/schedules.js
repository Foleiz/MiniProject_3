const express = require("express");

/**
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // POST /schedules
  router.post("/", async (req, res) => {
    const { routeId, startDate, rounds } = req.body;
    let connection;
    try {
      connection = await getConnection();
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        const scheduleTime = `${startDate} ${round.time}`; // Used to create a full timestamp
        await connection.execute(
          `INSERT INTO SCHEDULE (ROUTEID, ROUND, SCHEDULEDATE, BUSID, DRIVERID, SCHEDULETIME)
           VALUES (:routeId, :round, TO_DATE(:scheduleDate, 'YYYY-MM-DD'), :busId, :driverId, TO_TIMESTAMP(:scheduleTime, 'YYYY-MM-DD HH24:MI'))`,
          {
            routeId,
            round: i + 1,
            scheduleDate: startDate,
            busId: round.carId,
            driverId: round.driverId,
            scheduleTime: scheduleTime,
          }
        );
      }
      await connection.commit();
      res.status(201).json({ message: "บันทึกตารางสำเร็จ" });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error(err);
      res.status(500).send("Error saving schedule");
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

  // GET /schedules (ตัวอย่างสำหรับแสดงตาราง)
  router.get("/", async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT ROUTEID, ROUND, TO_CHAR(SCHEDULEDATE, 'YYYY-MM-DD') AS SCHEDULEDATE, BUSID, DRIVERID, TO_CHAR(SCHEDULETIME, 'HH24:MI') AS SCHEDULETIME FROM SCHEDULE ORDER BY SCHEDULEDATE DESC, ROUTEID, ROUND`
      );
      const schedules = result.rows.map((row) => ({
        routeId: row[0],
        round: row[1],
        scheduleDate: row[2],
        busId: row[3],
        driverId: row[4],
        scheduleTime: row[5],
      }));
      res.json(schedules);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching schedules");
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

  // DELETE /schedules
  router.delete("/", async (req, res) => {
    const { ids } = req.body;
    let connection;
    try {
      connection = await getConnection();
      for (const { routeId, round, scheduleDateTime } of ids) {
        // ใช้ routeId, round, scheduleDateTime ในการลบ
        const scheduleDate = scheduleDateTime.split(" ")[0]; // Extract YYYY-MM-DD part
        await connection.execute(
          `DELETE FROM SCHEDULE WHERE ROUTEID = :routeId AND ROUND = :round AND SCHEDULEDATE = TO_DATE(:scheduleDate, 'YYYY-MM-DD')`,
          { routeId, round, scheduleDate }
        );
      }
      await connection.commit();
      res.json({ message: "ลบสำเร็จ" });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error(err);
      res.status(500).send("Error deleting schedules");
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
