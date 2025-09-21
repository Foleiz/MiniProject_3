// routes/departments.js
const express = require("express");
const router = express.Router();

module.exports = (getConnection) => {
  // 🔹 GET ทั้งหมด (โชว์ในหน้าจอ)
  router.get("/", async (req, res) => {
    try {
      const connection = await getConnection();
      const result = await connection.execute(`
        SELECT 
          '' || LPAD(DepartmentID, 3, '0') as formatted_id,
          DepartmentID,
          DeptName 
        FROM DEPARTMENTS 
        ORDER BY DepartmentID
      `);

      const formattedData = result.rows.map((row) => ({
        id: row[0], // D001, D002, ...
        dbId: row[1], // เลขจริงใน DB
        name: row[2], // ชื่อแผนก
      }));

      res.json(formattedData);
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error fetching departments", details: err.message });
    }
  });

  // 🔹 เพิ่ม (รับ body: { department_name })
  router.post("/new", async (req, res) => {
    const { department_name } = req.body || {};
    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    try {
      const connection = await getConnection();

      // หากไม่มี SEQUENCE: ใช้ MAX()+1
      const nextIdRes = await connection.execute(
        `SELECT NVL(MAX(DepartmentID), 0) + 1 FROM DEPARTMENTS`
      );
      const nextId = nextIdRes.rows[0][0];

      await connection.execute(
        `INSERT INTO DEPARTMENTS (DepartmentID, DeptName) VALUES (:id, :name)`,
        { id: nextId, name: department_name.trim() },
        { autoCommit: true }
      );

      res.status(201).json({
        message: "Department created",
        item: {
          id: `D${String(nextId).padStart(3, "0")}`,
          dbId: nextId,
          name: department_name.trim(),
        },
      });
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error creating department", details: err.message });
    }
  });

  // 🔹 แก้ไขชื่อ (รับ body: { name })
  router.put("/db/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body || {};

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Department name is required" });
    }

    try {
      const connection = await getConnection();
      const result = await connection.execute(
        `UPDATE DEPARTMENTS SET DeptName = :name WHERE DepartmentID = :id`,
        { name: name.trim(), id: Number(id) },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        res
          .status(404)
          .json({ error: "Department not found or no changes made" });
      } else {
        res.json({ message: "Department updated successfully" });
      }
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error updating department", details: err.message });
    }
  });

  // 🔹 ลบ (ทีละรายการจาก path param)
  router.delete("/db/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const connection = await getConnection();
      const result = await connection.execute(
        `DELETE FROM DEPARTMENTS WHERE DepartmentID = :id`,
        { id: Number(id) },
        { autoCommit: true }
      );
      res.json({
        message: "Department deleted",
        rowsAffected: result.rowsAffected,
      });
      await connection.close();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error deleting department", details: err.message });
    }
  });

  return router;
};
