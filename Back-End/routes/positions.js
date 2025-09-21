// routes/positions.js
const express = require("express");
const router = express.Router();

module.exports = (getConnection) => {
  // 🔹 GET ทั้งหมด (โชว์ในหน้าจอ)
  router.get("/", async (req, res) => {
    try {
      const connection = await getConnection();
      const result = await connection.execute(`
        SELECT 
          '' || LPAD(PositionID, 3, '0') as formatted_id,
          PositionID,
          PositionName 
        FROM POSITIONS 
        ORDER BY PositionID
      `);

      const formattedData = result.rows.map((row) => ({
        id: row[0], // P001, P002, ...
        dbId: row[1], // เลขจริงใน DB
        name: row[2], // ชื่อตำแหน่ง
      }));

      res.json(formattedData);
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error fetching positions", details: err.message });
    }
  });

  // 🔹 เพิ่ม (รับ body: { position_name })
  router.post("/new", async (req, res) => {
    const { position_name } = req.body || {};
    if (!position_name || !position_name.trim()) {
      return res.status(400).json({ error: "Position name is required" });
    }

    try {
      const connection = await getConnection();

      // หากไม่มี SEQUENCE: ใช้ MAX()+1 ง่าย ๆ
      const nextIdRes = await connection.execute(
        `SELECT NVL(MAX(PositionID), 0) + 1 FROM POSITIONS`
      );
      const nextId = nextIdRes.rows[0][0];

      await connection.execute(
        `INSERT INTO POSITIONS (PositionID, PositionName) VALUES (:id, :name)`,
        { id: nextId, name: position_name.trim() },
        { autoCommit: true }
      );

      res.status(201).json({
        message: "Position created",
        item: {
          id: `P${String(nextId).padStart(3, "0")}`,
          dbId: nextId,
          name: position_name.trim(),
        },
      });
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error creating position", details: err.message });
    }
  });

  // 🔹 แก้ไขชื่อ (รับ body: { name })
  router.put("/db/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Position name is required" });
    }

    try {
      const connection = await getConnection();
      const result = await connection.execute(
        `UPDATE POSITIONS SET PositionName = :name WHERE PositionID = :id`,
        { name: name.trim(), id: Number(id) },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        res
          .status(404)
          .json({ error: "Position not found or no changes made" });
      } else {
        res.json({ message: "Position updated successfully" });
      }
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error updating position", details: err.message });
    }
  });

  // 🔹 ลบ (ทีละรายการจาก path param)
  router.delete("/db/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const connection = await getConnection();
      const result = await connection.execute(
        `DELETE FROM POSITIONS WHERE PositionID = :id`,
        { id: Number(id) },
        { autoCommit: true }
      );
      res.json({
        message: "Position deleted",
        rowsAffected: result.rowsAffected,
      });
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error deleting position", details: err.message });
    }
  });

  return router;
};
