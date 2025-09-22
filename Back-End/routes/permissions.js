// routes/permissions.js
const express = require("express");
const router = express.Router();

module.exports = (getConnection) => {
  // GET: list all permissions
  router.get("/", async (req, res) => {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT PERMISSIONID, PERMISSIONNAME FROM PERMISSIONS ORDER BY PERMISSIONID`
      );
      const data = result.rows.map((r) => ({
        PermissionID: r[0],
        PermissionName: r[1],
      }));
      res.json(data);
    } catch (err) {
      console.error("GET /permissions error:", err);
      res
        .status(500)
        .json({ error: "Error fetching permissions", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  return router;
};
