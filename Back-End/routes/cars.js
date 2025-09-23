const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");


// GET all cars (BUS table)

// GET all buses (cars)

router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT BUSID, PLATENUMBER, STATUS, BUSTYPEID FROM BUS`
    );

  // Map Oracle rows to objects with keys

    // Map Oracle rows to objects with keys

    const cars = result.rows.map(row => ({
      id: row[0],
      plateNumber: row[1],
      status: row[2],
      busTypeId: row[3],
    }));
    res.json(cars);
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching cars");
  }
});

module.exports = router;
