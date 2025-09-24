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
            busId: round.carId, // Ensure busId is correct here
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
      res.status(500).send(`Error saving schedule: ${err.message}`);
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
        `SELECT s.ROUTEID, s.ROUND, TO_CHAR(s.SCHEDULEDATE, 'YYYY-MM-DD') AS SCHEDULEDATE, 
              s.BUSID, s.DRIVERID, TO_CHAR(s.SCHEDULETIME, 'HH24:MI') AS SCHEDULETIME, 
              b.PLATENUMBER
       FROM SCHEDULE s
       LEFT JOIN BUS b ON s.BUSID = b.BUSID
       ORDER BY s.SCHEDULEDATE DESC, s.ROUTEID, s.ROUND`
      );

      const schedules = result.rows.map((row) => ({
        routeId: row[0],
        round: row[1],
        scheduleDate: row[2],
        busId: row[3],
        driverId: row[4],
        scheduleTime: row[5],
        plateNumber: row[6], // Add PLATENUMBER here
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
      for (const { routeId, round, scheduleDate } of ids) {
        // ใช้ routeId, round, และ scheduleDate ในการลบ
        await connection.execute(
          `DELETE FROM SCHEDULE WHERE ROUTEID = :routeId AND ROUND = :round AND TO_CHAR(SCHEDULEDATE, 'YYYY-MM-DD') = :scheduleDate`,
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
