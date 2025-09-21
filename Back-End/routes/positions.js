const express = require("express");
const router = express.Router();

// Get positions with formatted ID for frontend
module.exports = (getConnection) => {
  router.get("/", async (req, res) => {
    try {
      console.log("Fetching formatted positions...");
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

      console.log(
        "Formatted positions fetched:",
        formattedData.length,
        "records"
      );
      res.json(formattedData);
      await connection.close();
    } catch (err) {
      console.error("Error fetching formatted positions:", err);
      res
        .status(500)
        .json({ error: "Error fetching positions", details: err.message });
    }
  });

  // Add new position with auto-increment
  router.post("/new", async (req, res) => {
    const { position_name } = req.body;

    if (!position_name || position_name.trim() === "") {
      return res.status(400).json({ error: "Position name is required" });
    }

    try {
      console.log("Adding new position:", position_name);
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
      res
        .status(500)
        .json({ error: "Error adding position", details: err.message });
    }
  });

  // Delete position by database ID
  router.delete("/db/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log("Deleting position ID:", id);
      const connection = await getConnection();
      const result = await connection.execute(
        `DELETE FROM positions WHERE position_id = :id`,
        [id],
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        res.status(404).json({ error: "Position not found" });
      } else {
        console.log("Position deleted successfully");
        res.json({ message: "Position deleted successfully" });
      }
      await connection.close();
    } catch (err) {
      console.error("Error deleting position:", err);
      res
        .status(500)
        .json({ error: "Error deleting position", details: err.message });
    }
  });

  return router;
};
