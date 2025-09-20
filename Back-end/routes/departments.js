const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

async function getConnection() {
  return await oracledb.getConnection();
}

// GET all departments with formatted ID
router.get("/", async (req, res) => {
  try {
    console.log("Fetching formatted departments...");
    const connection = await getConnection();
    const result = await connection.execute(`
      SELECT 
        'D' || LPAD(DepartmentID, 3, '0') AS formatted_id,
        DepartmentID,
        DeptName
      FROM DEPARTMENTS
      ORDER BY DepartmentID
    `);

    const formattedData = result.rows.map((row) => ({
      id: row[0], // formatted_id (D001, D002, etc.)
      dbId: row[1], // original DepartmentID
      name: row[2], // DeptName
    }));

    console.log("Formatted departments fetched:", formattedData.length, "records");
    res.json(formattedData);
    await connection.close();
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Error fetching departments", details: err.message });
  }
});

// POST new department (auto-increment department_id)
router.post("/", async (req, res) => {
  const { department_name } = req.body;

  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    console.log("Adding new department:", department_name);
    const connection = await getConnection();

    // Get next ID from sequence
    const seqResult = await connection.execute(
      "SELECT seq_department.NEXTVAL FROM dual"
    );
    const nextId = seqResult.rows[0][0];

    // Insert with nextId
    await connection.execute(
      `INSERT INTO DEPARTMENTS (DepartmentID, DeptName) VALUES (:id, :name)`,
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
    res.status(500).json({ error: "Error adding department", details: err.message });
  }
});

// PUT update department name by id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { department_name } = req.body;

  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `UPDATE DEPARTMENTS SET DeptName = :department_name WHERE DepartmentID = :id`,
      [department_name.trim(), id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ message: "Department updated successfully" });
    await connection.close();
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Error updating department", details: err.message });
  }
});

// DELETE department by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM DEPARTMENTS WHERE DepartmentID = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({ message: "Department deleted successfully" });
    await connection.close();
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Error deleting department", details: err.message });
  }
});

module.exports = router;
