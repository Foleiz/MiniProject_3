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

  // POST: create new permission
  router.post("/new", async (req, res) => {
    const { permission_name } = req.body || {};
    if (!permission_name || !permission_name.trim()) {
      return res.status(400).json({ error: "Permission name is required" });
    }

    let conn;
    try {
      conn = await getConnection();

      const nextRes = await conn.execute(
        `SELECT NVL(MAX(PERMISSIONID), 0) + 1 FROM PERMISSIONS`
      );
      const nextId = nextRes.rows[0][0];

      await conn.execute(
        `INSERT INTO PERMISSIONS (PERMISSIONID, PERMISSIONNAME) VALUES (:id, :name)`,
        { id: nextId, name: permission_name.trim() },
        { autoCommit: true }
      );

      res.status(201).json({
        message: "Permission created",
        item: {
          PermissionID: nextId,
          PermissionName: permission_name.trim(),
        },
      });
    } catch (err) {
      console.error("POST /permissions/new error:", err);
      res.status(500).json({
        error: "Error creating permission",
        details: err.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  // DELETE: delete permission by real DB id
  router.delete("/db/:id", async (req, res) => {
    const { id } = req.params;

    let conn;
    try {
      conn = await getConnection();
      await conn.execute(
        `DELETE FROM POSITIONPERMISSIONS WHERE PERMISSIONID = :id`,
        { id: Number(id) }
      );
      const result = await conn.execute(
        `DELETE FROM PERMISSIONS WHERE PERMISSIONID = :id`,
        { id: Number(id) },
        { autoCommit: true }
      );
      res.json({
        message: "Permission deleted",
        rowsAffected: result.rowsAffected,
      });
    } catch (err) {
      console.error("DELETE /permissions/db/:id error:", err);
      res
        .status(500)
        .json({ error: "Error deleting permission", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  return router;
};
