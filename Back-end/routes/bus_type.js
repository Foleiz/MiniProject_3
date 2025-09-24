const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Get all bus types
router.get("/", async (req, res) => {
  const execute = req.app.locals.execute;
  try {
    const result = await execute(
      `SELECT BusTypeID AS "BusTypeID", 
              TypeName  AS "TypeName"
       FROM BUSTYPE`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching bus types:", err);
    res.status(500).json({ error: "Failed to fetch bus types" });
  }
});

module.exports = router;
