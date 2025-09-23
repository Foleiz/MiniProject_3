const express = require("express");

/**
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // GET all stops: ดึงข้อมูลจุดทั้งหมด
  router.get("/", async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        'SELECT STOPID, STOPNAME FROM "STOP" ORDER BY STOPID'
      );
      // แปลงข้อมูลให้เป็น format ที่ Frontend ใช้งานง่าย
      const stops = result.rows.map((row) => ({
        id: row[0],
        name: row[1],
      }));
      res.json(stops);
    } catch (err) {
      console.error("Error fetching stops:", err);
      res.status(500).send("Server error on fetching stops");
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

  // POST a new stop: เพิ่มจุดใหม่
  router.post("/", async (req, res) => {
    const { stopName } = req.body;
    if (!stopName) {
      return res.status(400).json({ error: "Stop name is required" });
    }
    let connection;
    try {
      connection = await getConnection();
      // หา ID ใหม่โดยอัตโนมัติ
      const idResult = await connection.execute(
        'SELECT NVL(MAX(STOPID), 0) + 1 FROM "STOP"'
      );
      const nextId = idResult.rows[0][0];

      await connection.execute(
        'INSERT INTO "STOP" (STOPID, STOPNAME) VALUES (:id, :name)',
        [nextId, stopName],
        { autoCommit: true }
      );

      res.status(201).json({ id: nextId, name: stopName });
    } catch (err) {
      console.error("Error adding stop:", err);
      res.status(500).send("Server error on adding stop");
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

  // DELETE a stop: ลบจุด
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        'DELETE FROM "STOP" WHERE STOPID = :id',
        [id],
        { autoCommit: true }
      );
      if (result.rowsAffected > 0) {
        res.status(200).send("Stop deleted successfully");
      } else {
        res.status(404).send("Stop not found");
      }
    } catch (err) {
      console.error("Error deleting stop:", err);
      res.status(500).send("Server error on deleting stop");
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
