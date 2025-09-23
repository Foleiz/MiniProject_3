const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// GET all buses (cars)
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT BUSID, PLATENUMBER, STATUS, BUSTYPEID FROM BUS`
    );

    // Map Oracle rows to objects with keys
    const cars = result.rows.map(row => ({
      id: row[0],        // BUSID
      plateNumber: row[1], // PLATENUMBER
      status: row[2],      // STATUS
      busTypeId: row[3],   // BUSTYPEID
    }));

    // Send JSON response with the cars data
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching cars");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection", closeErr);
      }
    }
  }
});

module.exports = router;
