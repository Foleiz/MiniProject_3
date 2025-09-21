const express = require("express");
const router = express.Router();

// Get departments with formatted ID for frontend
module.exports = (getConnection) => {
  router.get("/", async (req, res) => {
    try {
      console.log("Fetching formatted departments...");
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
        id: row[0], // formatted_id (D001, D002, etc.)
        dbId: row[1], // original DepartmentID from database
        name: row[2], // DeptName
      }));

      console.log(
        "Formatted departments fetched:",
        formattedData.length,
        "records"
      );
      res.json(formattedData);
      await connection.close();
    } catch (err) {
      console.error("Error fetching formatted departments:", err);
      res
        .status(500)
        .json({ error: "Error fetching departments", details: err.message });
    }
  });

  // Add new department with auto-increment
  router.post("/new", async (req, res) => {
    const { department_name } = req.body;

    if (!department_name || department_name.trim() === "") {
      return res.status(400).json({ error: "Department name is required" });
    }

    try {
      console.log("Adding new department:", department_name);
      const connection = await getConnection();

      // Get next ID
      const maxIdResult = await connection.execute(
        "SELECT NVL(MAX(DepartmentID), 0) + 1 as next_id FROM DEPARTMENTS"
      );
      const nextId = maxIdResult.rows[0][0];

      // Insert new department
      await connection.execute(
        `INSERT INTO DEPARTMENTS (DepartmentID, DeptName) VALUES (:departmentid, :departmentname)`,
        [nextId, department_name.trim()],
        { autoCommit: true }
      );

      console.log("Department added successfully:", nextId);
      res.status(201).json({
        message: "Department added successfully",
        id: nextId,
        formatted_id: `D${String(nextId).padStart(3, "0")}`,
        department_name: department_name.trim(),
      });
      await connection.close();
    } catch (err) {
      console.error("Error adding department:", err);
      res
        .status(500)
        .json({ error: "Error adding department", details: err.message });
    }
  });

  // Delete department by database ID
  router.delete("/db/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log("Deleting department ID:", id);
      const connection = await getConnection();
      const result = await connection.execute(
        `DELETE FROM DEPARTMENTS WHERE DepartmentID = :id`,
        [id],
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        res.status(404).json({ error: "Department not found" });
      } else {
        console.log("Department deleted successfully");
        res.json({ message: "Department deleted successfully" });
      }
      await connection.close();
    } catch (err) {
      console.error("Error deleting department:", err);
      res
        .status(500)
        .json({ error: "Error deleting department", details: err.message });
    }
  });

  return router;
};
