const express = require("express");

/**
 * Router Factory
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // GET: list all departments
  router.get("/", async (req, res) => {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(`
        SELECT DepartmentID, DeptName FROM DEPARTMENTS ORDER BY DepartmentID
      `);
      const data = result.rows.map((r) => ({
        id: r[0],
        name: r[1],
      }));
      res.json(data);
    } catch (err) {
      console.error("GET /departments error:", err);
      res
        .status(500)
        .json({ error: "Error fetching departments", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // POST: create new department
  router.post("/new", async (req, res) => {
    const { department_name } = req.body || {};
    if (!department_name?.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    let conn;
    try {
      conn = await getConnection();
      const nextRes = await conn.execute(
        `SELECT NVL(MAX(DepartmentID), 0) + 1 FROM DEPARTMENTS`
      );
      const nextId = nextRes.rows[0][0];

      await conn.execute(
        `INSERT INTO DEPARTMENTS (DepartmentID, DeptName) VALUES (:id, :name)`,
        { id: nextId, name: department_name.trim() },
        { autoCommit: true }
      );

      res.status(201).json({ id: nextId, name: department_name.trim() });
    } catch (err) {
      console.error("POST /departments/new error:", err);
      res
        .status(500)
        .json({ error: "Error creating department", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // PUT: update department
  router.put("/db/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `UPDATE DEPARTMENTS SET DeptName = :name WHERE DepartmentID = :id`,
        { name: name.trim(), id: Number(id) },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        return res
          .status(404)
          .json({ error: "Department not found or no changes made" });
      }

      res.json({ message: "Department updated successfully" });
    } catch (err) {
      console.error("PUT /departments/db/:id error:", err);
      res
        .status(500)
        .json({ error: "Error updating department", details: err.message });
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
        `DELETE FROM DEPARTMENTS WHERE DepartmentID = :id`,
        { id: Number(id) },
        { autoCommit: true }
      );

      res.json({
        message: "Department deleted",
        rowsAffected: result.rowsAffected,
      });
    } catch (err) {
      console.error("DELETE /departments/db/:id error:", err);
      res
        .status(500)
        .json({ error: "Error deleting department", details: err.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  return router;
};
