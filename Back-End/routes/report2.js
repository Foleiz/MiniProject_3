// routes/Report2.js
const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Report2: User behavior within date range
router.get("/", async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ message: "start,end required" });
  }

  let conn;
  try {
    conn = await oracledb.getConnection();

    const sql = `
      SELECT
        ua.USERID AS "userId",
        ua.FIRSTNAME || ' ' || ua.LASTNAME AS "userName",
        COUNT(*) AS "total",
        SUM(CASE 
              WHEN (UPPER(TRIM(rs.STATUSNAME)) IN ('COMPLETED','BOARDED')
                    OR rs.STATUSNAME IN ('ขึ้นรถจริง','เสร็จสิ้น'))
              THEN 1 ELSE 0 END) AS "boarded",
        SUM(CASE 
              WHEN (UPPER(TRIM(rs.STATUSNAME)) IN ('CANCELED','CANCELLED')
                    OR rs.STATUSNAME = 'ยกเลิก')
              THEN 1 ELSE 0 END) AS "canceled"
      FROM RESERVATION r
        JOIN USER_ACCOUNT ua ON ua.USERID = r.USERID
        JOIN RESERVATION_STATUS rs ON rs.STATUSID = r.RESERVATIONSTATUSID
      WHERE r.RESERVATIONTIME >= TO_DATE(:startDate, 'YYYY-MM-DD')
        AND r.RESERVATIONTIME <  TO_DATE(:endDate, 'YYYY-MM-DD') + 1
      GROUP BY ua.USERID, ua.FIRSTNAME, ua.LASTNAME
      ORDER BY "total" DESC
    `;

    const result = await conn.execute(
      sql,
      { startDate: start, endDate: end },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows ?? []);
  } catch (err) {
    console.error("[user-behavior] error:", err);
    res.status(500).json({ message: "server error", detail: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
});

module.exports = router;
