// routes/buses.js
const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Get all buses
router.get("/", async (req, res) => {
  const execute = req.app.locals.execute;
  try {
    const result = await execute(
        `SELECT b.BusID AS "BusID", 
            b.PlateNumber AS "PlateNumber", 
            b.Status AS "Status", 
            b.BusTypeID AS "BusTypeID", 
            bt.TypeName AS "TypeName"
        FROM BUS b
        LEFT JOIN BUSTYPE bt ON b.BusTypeID = bt.BusTypeID
        ORDER BY b.BusID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching buses:", err);
    res.status(500).json({ error: "Failed to fetch buses" });
  }
});

// Add new bus
router.post("/", async (req, res) => {
  const { BusID, PlateNumber, Status, BusTypeID } = req.body;
  const execute = req.app.locals.execute;
  try {
    await execute(
      `INSERT INTO BUS (BusID, PlateNumber, Status, BusTypeID)
       VALUES (:1, :2, :3, :4)`,
      [BusID, PlateNumber, Status, BusTypeID],
      { autoCommit: true }
    );
    res.json({ message: "เพิ่มรถเรียบร้อย" });
  } catch (err) {
    console.error("Error adding bus:", err);
    if (err && err.message && err.message.includes("ORA-00001")) {
      res.status(400).json({ error: "มีรหัสรถคันนี้แล้ว ไม่สามารถเพิ่มข้อมูลได้" });
    } else {
      res.status(500).json({ error: "Failed to add bus" });
    }
  }
});

// Update bus
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { PlateNumber, Status, BusTypeID } = req.body;
  const execute = req.app.locals.execute;
  try {
    await execute(
      `UPDATE BUS
       SET PlateNumber = :1, Status = :2, BusTypeID = :3
       WHERE BusID = :4`,
      [PlateNumber, Status, BusTypeID, id],
      { autoCommit: true }
    );
    res.json({ message: "แก้ไขรถเรียบร้อย" });
  } catch (err) {
    console.error("Error updating bus:", err);
    res.status(500).json({ error: "Failed to update bus" });
  }
});

// Delete bus
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const execute = req.app.locals.execute;
  try {
    await execute(
      `DELETE FROM BUS WHERE BusID = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: "ลบรถเรียบร้อย" });
  } catch (err) {
    console.error("Error deleting bus:", err);
    res.status(500).json({ error: "Failed to delete bus" });
  }
});

module.exports = router;
