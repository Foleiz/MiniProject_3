const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// GET all routes
router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM ROUTE");
    res.json(result.rows);
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching routes");
  }
});

module.exports = router;
