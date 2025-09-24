const express = require("express");

/**
 * Router Factory
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // GET: list all positions
  router.get("/", async (req, res) => {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(`
        SELECT PositionID, PositionName FROM POSITIONS ORDER BY PositionID
      `);
      const data = result.rows.map((r) => ({
        id: r[0],
        name: r[1],
      }));
      res.json(data);
    } catch (err) {
      console.error("GET /positions error:", err);
      res
        .status(500)
        .json({ error: "Error fetching positions", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // POST: create new position
  router.post("/new", async (req, res) => {
    const { position_name } = req.body || {};
    if (!position_name?.trim()) {
      return res.status(400).json({ error: "Position name is required" });
    }

    let conn;
    try {
      conn = await getConnection();
      const nextRes = await conn.execute(
        `SELECT NVL(MAX(PositionID), 0) + 1 FROM POSITIONS`
      );
      const nextId = nextRes.rows[0][0];

      await conn.execute(
        `INSERT INTO POSITIONS (PositionID, PositionName) VALUES (:id, :name)`,
        { id: nextId, name: position_name.trim() },
        { autoCommit: true }
      );

      res.status(201).json({ id: nextId, name: position_name.trim() });
    } catch (err) {
      console.error("POST /positions/new error:", err);
      res
        .status(500)
        .json({ error: "Error creating position", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // PUT
  router.put("/db/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ error: "Position name is required" });
    }

    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `UPDATE POSITIONS SET PositionName = :name WHERE PositionID = :id`,
        { name: name.trim(), id: Number(id) },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        return res
          .status(404)
          .json({ error: "Position not found or no changes made" });
      }

      res.json({ message: "Position updated successfully" });
    } catch (err) {
      console.error("PUT /positions/db/:id error:", err);
      res
        .status(500)
        .json({ error: "Error updating position", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // DELETE
  router.delete("/db/:id", async (req, res) => {
    const { id } = req.params;

    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `DELETE FROM POSITIONS WHERE PositionID = :id`,
        { id: Number(id) },
        { autoCommit: true }
      );

      res.json({
        message: "Position deleted",
        rowsAffected: result.rowsAffected,
      });
    } catch (err) {
      console.error("DELETE /positions/db/:id error:", err);
      res
        .status(500)
        .json({ error: "Error deleting position", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  return router;
};
