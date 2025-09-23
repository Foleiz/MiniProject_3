const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

<<<<<<< Updated upstream
router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT ROUTEID, ROUTENAME, DESCRIPTION FROM ROUTE`
    );
    const routes = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
    }));
    res.json(routes);
    await connection.close();
=======
// GET all routes
router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM ROUTE");
    res.json(result.rows);
    connection.close();
>>>>>>> Stashed changes
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching routes");
  }
});

<<<<<<< Updated upstream
module.exports = router;
=======
module.exports = router;
>>>>>>> Stashed changes
