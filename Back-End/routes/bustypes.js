const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// GET all bus types
router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT BUSTYPEID, TYPENAME, CAPACITY FROM BUSTYPE`
    );
    const bustypes = result.rows.map((row) => ({
      BusTypeID: row[0],
      TypeName: row[1],
      Capacity: row[2],
    }));
    res.json(bustypes);
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching bustypes");
  }
});

// POST a new bus type
router.post("/", async (req, res) => {
  const { BusTypeID, TypeName, Capacity } = req.body;
  if (!BusTypeID || !TypeName || !Capacity) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const connection = await oracledb.getConnection();
    await connection.execute(
      `INSERT INTO BUSTYPE (BUSTYPEID, TYPENAME, CAPACITY) VALUES (:1, :2, :3)`,
      [BusTypeID, TypeName, Capacity],
      { autoCommit: true }
    );
    connection.close();
    res.status(201).json({ BusTypeID, TypeName, Capacity });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating bustype");
  }
});

// PUT to update a bus type
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { TypeName, Capacity } = req.body;
  if (!TypeName || !Capacity) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE BUSTYPE SET TYPENAME = :1, CAPACITY = :2 WHERE BUSTYPEID = :3`,
      [TypeName, Capacity, id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Bus type not found");
    }

    connection.close();
    res.status(200).json({ BusTypeID: id, TypeName, Capacity });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating bustype");
  }
});

// DELETE a bus type
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection();
    await connection.execute(
      `DELETE FROM BUSTYPE WHERE BUSTYPEID = :1`,
      [id],
      { autoCommit: true }
    );
    connection.close();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting bustype");
  }
});

module.exports = router;
