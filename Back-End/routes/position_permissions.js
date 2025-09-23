// routes/position_permissions.js
const express = require("express");
const router = express.Router();

module.exports = (getConnection) => {
  // GET: list all position-permission mappings
  router.get("/", async (req, res) => {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT POSITIONID, PERMISSIONID, DEPARTMENTID FROM POSITIONPERMISSIONS`
      );

      // New output format: { "PositionID": { "departmentId": X, "permissionIds": [Y, Z] } }
      const mappings = result.rows.reduce((acc, [posId, permId, deptId]) => {
        if (!acc[posId]) {
          // The first permission encountered for a position sets the department.
          // This assumes all permissions for a given position have the same department.
          acc[posId] = { departmentId: deptId, permissionIds: [] };
        }
        acc[posId].permissionIds.push(permId);
        return acc;
      }, {});

      res.json(mappings);
    } catch (err) {
      console.error("GET /position-permissions error:", err);
      res
        .status(500)
        .json({ error: "Error fetching mappings", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // PUT: Overwrite all mappings for a given set of positions
  router.put("/", async (req, res) => {
    // New Body format: { positionId1: { departmentId: X, permissionIds: [p1, p2] }, ... }
    const mappings = req.body;
    if (typeof mappings !== "object" || mappings === null) {
      return res.status(400).json({ error: "Invalid payload format." });
    }

    const positionIds = Object.keys(mappings)
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0);
    if (positionIds.length === 0) {
      return res.status(200).json({ message: "No permissions to update." });
    }

    let conn;
    try {
      conn = await getConnection();

      // SQL to delete existing permissions for the affected positions
      const deleteBinds = positionIds.reduce(
        (binds, id, i) => ({ ...binds, [`id${i}`]: id }),
        {}
      );
      const deleteSql = `DELETE FROM POSITIONPERMISSIONS WHERE PositionID IN (${positionIds
        .map((_, i) => `:id${i}`)
        .join(",")})`;
      await conn.execute(deleteSql, deleteBinds);

      // Prepare for bulk insert
      const rowsToInsert = [];
      for (const posIdStr in mappings) {
        const posId = Number(posIdStr);
        const { departmentId, permissionIds } = mappings[posIdStr];
        if (Array.isArray(permissionIds) && departmentId != null) {
          for (const permId of permissionIds) {
            rowsToInsert.push([posId, Number(permId), Number(departmentId)]);
          }
        }
      }

      if (rowsToInsert.length > 0) {
        const insertSql = `INSERT INTO POSITIONPERMISSIONS (PositionID, PermissionID, DEPARTMENTID) VALUES (:1, :2, :3)`;
        await conn.executeMany(insertSql, rowsToInsert);
      }

      await conn.commit();
      res.status(200).json({ message: "Permissions saved successfully." });
    } catch (err) {
      if (conn) await conn.rollback();
      console.error("PUT /position-permissions error:", err);
      res
        .status(500)
        .json({ error: "Error saving permissions", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  router.get("/", async (req, res) => {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(`
      SELECT pp.PositionID, pp.PermissionID, pp.DepartmentID,
             p.PositionName, perm.PermissionName, d.DeptName
      FROM POSITIONPERMISSIONS pp
      JOIN POSITIONS p ON pp.PositionID = p.PositionID
      JOIN PERMISSIONS perm ON pp.PermissionID = perm.PermissionID
      JOIN DEPARTMENTS d ON pp.DepartmentID = d.DepartmentID
      ORDER BY pp.PositionID, pp.DepartmentID, pp.PermissionID
    `);
      res.json(
        result.rows.map((row) => ({
          PositionID: row[0],
          PermissionID: row[1],
          DepartmentID: row[2],
          PositionName: row[3],
          PermissionName: row[4],
          DeptName: row[5],
        }))
      );
    } catch (err) {
      console.error("GET /position-permissions error:", err);
      res.status(500).json({ error: "Error fetching data" });
    } finally {
      if (conn) await conn.close();
    }
  });

  return router;
};
