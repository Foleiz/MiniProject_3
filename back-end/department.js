const express = require("express");
const { getConnection } = require("./database");

const router = express.Router();

// Get all departments
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM departments ORDER BY department_id"
    );
    res.json(result.rows);
    await connection.close();
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Error fetching departments" });
  }
});

// Get departments with formatted ID for frontend
router.get("/formatted", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(`
      SELECT 
        'D' || LPAD(department_id, 3, '0') as formatted_id,
        department_id,
        department_name 
      FROM departments 
      ORDER BY department_id
    `);

    const formattedData = result.rows.map((row) => ({
      id: row[0], // formatted_id (D001, D002, etc.)
      dbId: row[1], // original department_id from database
      name: row[2], // department_name
    }));

    res.json(formattedData);
    await connection.close();
  } catch (err) {
    console.error("Error fetching formatted departments:", err);
    res.status(500).json({ error: "Error fetching departments" });
  }
});

// Add new department (original endpoint)
router.post("/", async (req, res) => {
  const { department_id, department_name } = req.body;
  try {
    const connection = await getConnection();
    await connection.execute(
      `INSERT INTO departments (department_id, department_name) VALUES (:department_id, :department_name)`,
      [department_id, department_name],
      { autoCommit: true }
    );
    res.status(201).json({ message: "Department added successfully" });
    await connection.close();
  } catch (err) {
    console.error("Error adding department:", err);
    res.status(500).json({ error: "Error adding department" });
  }
});

// Add new department with auto-increment
router.post("/new", async (req, res) => {
  const { department_name } = req.body;

  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    const connection = await getConnection();

    // Get next ID
    const maxIdResult = await connection.execute(
      "SELECT NVL(MAX(department_id), 0) + 1 as next_id FROM departments"
    );
    const nextId = maxIdResult.rows[0][0];

    // Insert new department
    await connection.execute(
      `INSERT INTO departments (department_id, department_name) VALUES (:department_id, :department_name)`,
      [nextId, department_name.trim()],
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Department added successfully",
      id: nextId,
      formatted_id: `D${String(nextId).padStart(3, "0")}`,
      department_name: department_name.trim(),
    });
    await connection.close();
  } catch (err) {
    console.error("Error adding department:", err);
    res.status(500).json({ error: "Error adding department" });
  }
});

// Update department
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { department_name } = req.body;

  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `UPDATE departments SET department_name = :department_name WHERE department_id = :id`,
      [department_name.trim(), id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Department not found" });
    } else {
      res.json({ message: "Department updated successfully" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Error updating department" });
  }
});

// Delete department (original endpoint)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM departments WHERE department_id = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Department not found" });
    } else {
      res.json({ message: "Department deleted successfully" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Error deleting department" });
  }
});

// Delete department by database ID
router.delete("/db/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM departments WHERE department_id = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Department not found" });
    } else {
      res.json({ message: "Department deleted successfully" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Error deleting department" });
  }
});

// Delete multiple departments
router.delete("/batch/delete", async (req, res) => {
  const { ids } = req.body; // Array of department IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Department IDs are required" });
  }

  try {
    const connection = await getConnection();

    // Create placeholders for the IN clause
    const placeholders = ids.map((_, index) => `:id${index}`).join(",");
    const binds = {};
    ids.forEach((id, index) => {
      binds[`id${index}`] = id;
    });

    const result = await connection.execute(
      `DELETE FROM departments WHERE department_id IN (${placeholders})`,
      binds,
      { autoCommit: true }
    );

    res.json({
      message: `${result.rowsAffected} department(s) deleted successfully`,
      deletedCount: result.rowsAffected,
    });
    await connection.close();
  } catch (err) {
    console.error("Error deleting departments:", err);
    res.status(500).json({ error: "Error deleting departments" });
  }
});

module.exports = router;
