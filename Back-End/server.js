const express = require("express");
const cors = require("cors");
const { initOracle } = require("../database.js");

// Import route modules
const positionRoutes = require("../position.js");
const departmentRoutes = require("../department.js");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Oracle connection
initOracle();

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/positions", positionRoutes);
app.use("/departments", departmentRoutes);

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
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("📋 Available endpoints:");
  console.log("  GET    /positions");
  console.log("  GET    /positions/formatted");
  console.log("  POST   /positions/new");
  console.log("  PUT    /positions/:id");
  console.log("  DELETE /positions/db/:id");
  console.log("  DELETE /positions/batch/delete");
  console.log("");
  console.log("  GET    /departments");
  console.log("  GET    /departments/formatted");
  console.log("  POST   /departments/new");
  console.log("  PUT    /departments/:id");
  console.log("  DELETE /departments/db/:id");
  console.log("  DELETE /departments/batch/delete");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down server...");
  process.exit(0);
});
