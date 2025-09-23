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
        `SELECT POSITIONID, PERMISSIONID FROM POSITIONPERMISSIONS`
      );

      // Group permissions by position ID
      // Output format: { "1": [10, 20], "2": [10, 30] }
      const mappings = result.rows.reduce((acc, [posId, permId]) => {
        if (!acc[posId]) {
          acc[posId] = [];
        }
        acc[posId].push(permId);
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
    // Body format: { positionId1: [permId1, permId2], positionId2: [permId3] }
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
        const permIds = mappings[posIdStr];
        if (Array.isArray(permIds)) {
          for (const permId of permIds) {
            rowsToInsert.push([posId, Number(permId)]);
          }
        }
      }

      if (rowsToInsert.length > 0) {
        const insertSql = `INSERT INTO POSITIONPERMISSIONS (PositionID, PermissionID) VALUES (:1, :2)`;
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

  return router;
};
