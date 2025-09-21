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
    const bustypes = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      capacity: row[2],
    }));
    res.json(bustypes);
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching bustypes");
  }
});

module.exports = router;
