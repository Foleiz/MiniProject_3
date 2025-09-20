const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

async function getConnection() {
  return await oracledb.getConnection();
}

// GET all positions with formatted ID
router.get("/", async (req, res) => {
  try {
    console.log("Fetching formatted positions...");
    const connection = await getConnection();
    const result = await connection.execute(`
      SELECT
        'P' || LPAD(positionID, 3, '0') AS formatted_id,
        positionID,
        positionName
      FROM positions
      ORDER BY positionID
    `);

    const formattedData = result.rows.map(row => ({
      id: row[0],      // formatted_id (P001, P002, etc.)
      dbId: row[1],    // original position_id
      name: row[2],    // position_name
    }));

    console.log("Formatted positions fetched:", formattedData.length, "records");
    res.json(formattedData);
    await connection.close();
  } catch (err) {
    console.error("Error fetching positions:", err);
    res.status(500).json({ error: "Error fetching positions", details: err.message });
  }
});

// POST new position (auto-increment position_id)
router.post("/", async (req, res) => {
  const { position_name } = req.body;

  if (!position_name || position_name.trim() === "") {
    return res.status(400).json({ error: "Position name is required" });
  }

  try {
    console.log("Adding new position:", position_name);
    const connection = await getConnection();


    // Get next ID from sequence
    const seqResult = await connection.execute(
      "SELECT seq_position.NEXTVAL FROM dual"
    );
    const nextId = seqResult.rows[0][0];

    // Insert new position
    await connection.execute(
      `INSERT INTO positions (positionID, positionName) VALUES (:id, :name)`,
      [nextId, position_name.trim()],
      { autoCommit: true }
    );

    console.log("Position added successfully:", nextId);
    res.status(201).json({
      message: "Position added successfully",
      id: nextId,
      formatted_id: `P${String(nextId).padStart(3, "0")}`,
      position_name: position_name.trim(),
    });

    await connection.close();
  } catch (err) {
    console.error("Error adding position:", err);
    res.status(500).json({ error: "Error adding position", details: err.message });
  }
});

// PUT update position name by id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { position_name } = req.body;

  if (!position_name || position_name.trim() === "") {
    return res.status(400).json({ error: "Position name is required" });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `UPDATE positions SET position_name = :name WHERE positionID = :id`,
      [position_name.trim(), id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Position not found" });
    }

    res.json({ message: "Position updated successfully" });
    await connection.close();
  } catch (err) {
    console.error("Error updating position:", err);
    res.status(500).json({ error: "Error updating position", details: err.message });
  }
});

// DELETE position by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM positions WHERE positionID = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Position not found" });
    }

    res.json({ message: "Position deleted successfully" });
    await connection.close();
  } catch (err) {
    console.error("Error deleting position:", err);
    res.status(500).json({ error: "Error deleting position", details: err.message });
  }
});

module.exports = router;
