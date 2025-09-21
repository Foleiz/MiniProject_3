const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// GET all drivers (employees with POSITIONID=3)
router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT EMPLOYEEID, FIRSTNAME, LASTNAME FROM EMPLOYEES WHERE POSITIONID = 3`
    );
    const drivers = result.rows.map(row => ({
      id: row[0],
      name: row[1] + ' ' + row[2],
    }));
    res.json(drivers);
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching drivers");
  }
});

module.exports = router;
