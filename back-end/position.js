const express = require("express");
const { getConnection } = require("./database");

const router = express.Router();

// Get all positions
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM positions ORDER BY position_id"
    );
    res.json(result.rows);
    await connection.close();
  } catch (err) {
    console.error("Error fetching positions:", err);
    res.status(500).json({ error: "Error fetching positions" });
  }
});

// Get positions with formatted ID for frontend
router.get("/formatted", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(`
      SELECT 
        'P' || LPAD(position_id, 3, '0') as formatted_id,
        position_id,
        position_name 
      FROM positions 
      ORDER BY position_id
    `);

    const formattedData = result.rows.map((row) => ({
      id: row[0], // formatted_id (P001, P002, etc.)
      dbId: row[1], // original position_id from database
      name: row[2], // position_name
    }));

    res.json(formattedData);
    await connection.close();
  } catch (err) {
    console.error("Error fetching formatted positions:", err);
    res.status(500).json({ error: "Error fetching positions" });
  }
});

// Add new position (original endpoint)
router.post("/", async (req, res) => {
  const { position_id, position_name } = req.body;
  try {
    const connection = await getConnection();
    await connection.execute(
      `INSERT INTO positions (position_id, position_name) VALUES (:position_id, :position_name)`,
      [position_id, position_name],
      { autoCommit: true }
    );
    res.status(201).json({ message: "Position added successfully" });
    await connection.close();
  } catch (err) {
    console.error("Error adding position:", err);
    res.status(500).json({ error: "Error adding position" });
  }
});

// Add new position with auto-increment
router.post("/new", async (req, res) => {
  const { position_name } = req.body;

  if (!position_name || position_name.trim() === "") {
    return res.status(400).json({ error: "Position name is required" });
  }

  try {
    const connection = await getConnection();

    // Get next ID
    const maxIdResult = await connection.execute(
      "SELECT NVL(MAX(position_id), 0) + 1 as next_id FROM positions"
    );
    const nextId = maxIdResult.rows[0][0];

    // Insert new position
    await connection.execute(
      `INSERT INTO positions (position_id, position_name) VALUES (:position_id, :position_name)`,
      [nextId, position_name.trim()],
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Position added successfully",
      id: nextId,
      formatted_id: `P${String(nextId).padStart(3, "0")}`,
      position_name: position_name.trim(),
    });
    await connection.close();
  } catch (err) {
    console.error("Error adding position:", err);
    res.status(500).json({ error: "Error adding position" });
  }
});

// Update position
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { position_name } = req.body;

  if (!position_name || position_name.trim() === "") {
    return res.status(400).json({ error: "Position name is required" });
  }

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `UPDATE positions SET position_name = :position_name WHERE position_id = :id`,
      [position_name.trim(), id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Position not found" });
    } else {
      res.json({ message: "Position updated successfully" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error updating position:", err);
    res.status(500).json({ error: "Error updating position" });
  }
});

// Delete position (original endpoint)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM positions WHERE position_id = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Position not found" });
    } else {
      res.json({ message: "Position deleted successfully" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error deleting position:", err);
    res.status(500).json({ error: "Error deleting position" });
  }
});

// Delete position by database ID
router.delete("/db/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM positions WHERE position_id = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Position not found" });
    } else {
      res.json({ message: "Position deleted successfully" });
    }
    await connection.close();
  } catch (err) {
    console.error("Error deleting position:", err);
    res.status(500).json({ error: "Error deleting position" });
  }
});

// Delete multiple positions
router.delete("/batch/delete", async (req, res) => {
  const { ids } = req.body; // Array of position IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Position IDs are required" });
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
      `DELETE FROM positions WHERE position_id IN (${placeholders})`,
      binds,
      { autoCommit: true }
    );

    res.json({
      message: `${result.rowsAffected} position(s) deleted successfully`,
      deletedCount: result.rowsAffected,
    });
    await connection.close();
  } catch (err) {
    console.error("Error deleting positions:", err);
    res.status(500).json({ error: "Error deleting positions" });
  }
});

module.exports = router;
