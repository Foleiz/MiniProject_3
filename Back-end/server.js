require('dotenv').config();
const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/auth");
const busTypeRoutes = require("./routes/bus_type");
const busRoutes = require("./routes/buses");
const departmentRoutes = require("./routes/departments");
const employeeRoutes = require("./routes/employees");
const permissionRoutes = require("./routes/permissions");
const positionPermissionsRoutes = require("./routes/positionPermissions");
const positionRoutes = require("./routes/positions");
const reportRoutes = require("./routes/reports");
const reservationRoutes = require("./routes/reservations");
const routeStopRoutes = require("./routes/route_stop");
const routeRoutes = require("./routes/routes");
const scheduleRoutes = require("./routes/schedules");
const stopRoutes = require("./routes/stops");
const userstatusRoutes = require("./routes/user_status");
const userRoutes = require("./routes/users");

const app = express();
const PORT = 3000;

// Attach execute helper to app
const { dbConfig, execute } = require("./utils/db");
app.locals.execute = execute;

// Middleware
app.use(cors());
app.use(express.json());

// Load Oracle Thick client
const clientLibDir =
  process.platform === "win32"
    ? "C:\\oracle\\instantclient_23_9" // <-- change this path
    : "/opt/oracle/instantclient_23_9"; // <-- change for Linux

oracledb.initOracleClient({ libDir: clientLibDir });    

// Create pool
async function initOracle() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Oracle DB connected");
  } catch (err) {
    console.error("❌ Oracle DB connection error:", err);
    process.exit(1);
  }
}

//Routes เปิดใช้เมื่อทำไฟล์ .js เสร็จ
app.use("/api/auth", authRoutes);
//app.use("/api/reservations", reservationRoutes);
app.use("/api/buses", busRoutes);
//app.use("/api/routes", routeRoutes);
//app.use("/api/stops", stopRoutes);
//app.use("/api/schedules", scheduleRoutes);
//app.use("/api/permissions", permissionRoutes);
//app.use("/api/position-permissions", positionPermissionsRoutes);
//app.use("/api/reports", reportRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/bus_type", busTypeRoutes);
//app.use("/api/route-stop", routeStopRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user_status", userstatusRoutes);

// Start server after DB pool is ready
initOracle().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
