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
    // Map the rows to objects with keys matching the database columns
    const bustypes = result.rows.map((row) => ({
      BUSTYPEID: row[0],
      TYPENAME: row[1],
      CAPACITY: row[2],
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
  const { id, type, seats } = req.body;
  if (!id || !type || !seats) {
    return res.status(400).send("Missing required fields: id, type, seats");
  }
  try {
    const connection = await oracledb.getConnection();
    await connection.execute(
      `INSERT INTO BUSTYPE (BUSTYPEID, TYPENAME, CAPACITY) VALUES (:id, :type, :seats)`,
      [id, type, seats],
      { autoCommit: true }
    );
    connection.close();
    res.status(201).json({ BUSTYPEID: id, TYPENAME: type, CAPACITY: seats });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating bustype");
  }
});

// PUT to update a bus type
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { type, seats } = req.body;
  if (!type || !seats) {
    return res.status(400).send("Missing required fields: type, seats");
  }
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE BUSTYPE SET TYPENAME = :type, CAPACITY = :seats WHERE BUSTYPEID = :id`,
      [type, seats, id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Bus type not found");
    }

    connection.close();
    res.status(200).json({ BUSTYPEID: id, TYPENAME: type, CAPACITY: seats });
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
      `DELETE FROM BUSTYPE WHERE BUSTYPEID = :id`,
      [id],
      { autoCommit: true }
    );
    connection.close();
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting bustype");
  }
});

module.exports = router;
