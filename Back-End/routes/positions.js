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
          '' || LPAD(PositionID, 3, '0') as formatted_id,
          PositionID,
          PositionName 
        FROM POSITIONS 
        ORDER BY PositionID
      `);

      const formattedData = result.rows.map((row) => ({
        id: row[0], // formatted_id (P001, P002, etc.)
        dbId: row[1], // original PositionID from database
        name: row[2], // PositionName
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
        "SELECT NVL(MAX(PositionID), 0) + 1 as next_id FROM POSITIONS"
      );
      const nextId = maxIdResult.rows[0][0];

      // Insert new position
      await connection.execute(
        `INSERT INTO POSITIONS (PositionID, PositionName) VALUES (:positionid, :positionname)`,
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
        `DELETE FROM POSITIONS WHERE PositionID = :id`,
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

  router.put("/db/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Position name is required" });
    }

    try {
      console.log(`Updating position ID: ${id} with new name: ${name}`);
      const connection = await getConnection();
      const result = await connection.execute(
        `UPDATE POSITIONS SET PositionName = :name WHERE PositionID = :id`,
        [name.trim(), id],
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        res
          .status(404)
          .json({ error: "Position not found or no changes made" });
      } else {
        console.log("Position updated successfully");
        res.json({ message: "Position updated successfully" });
      }
      await connection.close();
    } catch (err) {
      console.error("Error updating position:", err);
      res
        .status(500)
        .json({ error: "Error updating position", details: err.message });
    }
  });

  return router;
};
