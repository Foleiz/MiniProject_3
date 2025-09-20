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

// Initialize Oracle connection
initOracle();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

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

// Position routes
const positionsRoutes = require("./routes/positions")(getConnection);

// Department routes
const departmentsRoutes = require("./routes/departments")(getConnection);

// Mount position and department routes
app.use("/positions", positionsRoutes);
app.use("/departments", departmentsRoutes);

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
