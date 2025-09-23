const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    
    // แก้ไข query เพื่อไม่ดึง ROUTEID
    const result = await connection.execute(
      `SELECT ROUTENAME, DESCRIPTION FROM ROUTE`
    );
    
    // กรองข้อมูลที่ต้องการ (ไม่รวม ROUTEID)
    const routes = result.rows.map(row => ({
      name: row[0],      // ROUTENAME
      description: row[1], // DESCRIPTION
    }));
    
    res.json(routes); // ส่งข้อมูลที่กรองแล้วกลับไปยัง Frontend
    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching routes");
  }
});

module.exports = router;
