const express = require("express");

/**
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // Function to get all dates between start and end date
  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date).toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }

    return dates;
  };

  // POST /schedules
  router.post("/", async (req, res) => {
    const { routeId, startDate, endDate, rounds } = req.body;
    let connection;

    console.log("Received data:", { routeId, startDate, endDate, rounds }); // Debug log

    // Validate required fields
    if (!routeId || !startDate || !endDate || !rounds || rounds.length === 0) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    try {
      connection = await getConnection();

      // Get all dates between start and end date
      const dateRange = getDatesBetween(startDate, endDate);
      console.log("Date range:", dateRange); // Debug log

      // Insert schedule for each date in the range
      for (const currentDate of dateRange) {
        for (let i = 0; i < rounds.length; i++) {
          const round = rounds[i];
          const scheduleTime = `${currentDate} ${round.time}`; // Create full timestamp

          console.log(
            `Inserting: ${currentDate}, Round ${i + 1}, Time: ${round.time}`
          ); // Debug log

          await connection.execute(
            `INSERT INTO SCHEDULE (ROUTEID, ROUND, SCHEDULEDATE, BUSID, DRIVERID, SCHEDULETIME)
             VALUES (:routeId, :round, TO_DATE(:scheduleDate, 'YYYY-MM-DD'), :busId, :driverId, TO_TIMESTAMP(:scheduleTime, 'YYYY-MM-DD HH24:MI'))`,
            {
              routeId: routeId,
              round: i + 1,
              scheduleDate: currentDate,
              busId: round.carId,
              driverId: round.driverId,
              scheduleTime: scheduleTime,
            }
          );
        }
      }

      await connection.commit();
      res.status(201).json({
        message: `บันทึกตารางสำเร็จ สำหรับ ${dateRange.length} วัน (${startDate} ถึง ${endDate})`,
        datesCreated: dateRange.length,
        roundsPerDay: rounds.length,
        totalRecords: dateRange.length * rounds.length,
        dateRange: dateRange,
      });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Database error:", err);
      res
        .status(500)
        .json({ message: `Error saving schedule: ${err.message}` });
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
        plateNumber: row[6],
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

  // PUT /schedules (Update a schedule)
  router.put("/", async (req, res) => {
    const { routeId, round, scheduleDate, time, driverId, carId } = req.body;
    let connection;
    try {
      connection = await getConnection();
      const scheduleTime = `${scheduleDate} ${time}`;
      await connection.execute(
        `UPDATE SCHEDULE 
         SET DRIVERID = :driverId, BUSID = :busId, SCHEDULETIME = TO_TIMESTAMP(:scheduleTime, 'YYYY-MM-DD HH24:MI')
         WHERE ROUTEID = :routeId AND ROUND = :round AND TO_CHAR(SCHEDULEDATE, 'YYYY-MM-DD') = :scheduleDate`,
        {
          driverId,
          busId: carId,
          scheduleTime,
          routeId,
          round,
          scheduleDate,
        },
        { autoCommit: true }
      );
      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    } catch (err) {
      console.error("Error updating schedule:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
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
