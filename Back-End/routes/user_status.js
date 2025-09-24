// routes/user_status.js
const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Get all statuses (for dropdown)
router.get("/", async (req, res) => {
  const execute = req.app.locals.execute;
  try {
    const result = await execute(
      `SELECT userstatusid AS STATUSID, statusname AS STATUSNAME FROM userstatus`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user statuses:", err);
    res.status(500).json({ error: "Failed to fetch user statuses" });
  }
});

module.exports = router;