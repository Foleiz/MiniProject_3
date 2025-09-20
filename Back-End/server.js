const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Load Thick mode
const clientLibDir =
  process.platform === "win32"
    ? "F:\\\\year3_term1\\\\4.MIIC1324 PM\\\\Lab12\\\\Oracle\\\\instantclient_23_9" // <-- change this path
    : "/opt/oracle/instantclient_11_2"; // <-- change for Linux

oracledb.initOracleClient({ libDir: clientLibDir });

// Oracle DB config
const dbConfig = {
  user: "DBT68040",
  password: "94298",
  connectString: `(DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCP)(HOST=203.188.54.7)(PORT=1521))
    (CONNECT_DATA=(SID=Database))
  )`,
};

// Initialize Oracle connection pool
async function initOracle() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Oracle DB connected");
  } catch (err) {
    console.error("❌ Oracle DB connection error:", err);
    process.exit(1);
  }
}

// Get connection from pool
async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (err) {
    console.error("Error getting database connection:", err);
    throw err;
  }
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Initialize Oracle connection
initOracle();

// Health check endpoint
app.get("/", (req, res) => {
  console.log("Health check called");
  res.json({
    message: "Server is running perfectly",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /positions/formatted",
      "POST /positions/new",
      "DELETE /positions/db/:id",
      "GET /departments/formatted",
      "POST /departments/new",
      "DELETE /departments/db/:id",
    ],
  });
});

// ===== POSITION ROUTES =====

// Get positions with formatted ID for frontend
app.get("/positions/formatted", async (req, res) => {
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
app.post("/positions/new", async (req, res) => {
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
app.delete("/positions/db/:id", async (req, res) => {
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

// ===== DEPARTMENT ROUTES =====

// Get departments with formatted ID for frontend
app.get("/departments/formatted", async (req, res) => {
  try {
    console.log("Fetching formatted departments...");
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
app.post("/departments/new", async (req, res) => {
  const { department_name } = req.body;

  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    console.log("Adding new department:", department_name);
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
app.delete("/departments/db/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log("Deleting department ID:", id);
    const connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM departments WHERE department_id = :id`,
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log("404 - Route not found:", req.method, req.originalUrl);
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET    /positions/formatted");
  console.log("  POST   /positions/new");
  console.log("  DELETE /positions/db/:id");
  console.log("  GET    /departments/formatted");
  console.log("  POST   /departments/new");
  console.log("  DELETE /departments/db/:id");
  console.log("Ready to handle requests!");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down server...");
  process.exit(0);
});
