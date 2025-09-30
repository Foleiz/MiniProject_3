const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ===== Middleware =====
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (err) {
    console.error("Error getting database connection:", err);
    throw err;
  }
}

async function execute(query, binds = {}, options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, binds, {
      autoCommit: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT, // important
      ...options,
    });
    return result;
  } finally {
    if (connection) await connection.close();
  }
}

app.locals.execute = execute;

// ===== Routes ของ cars และ drivers (เก็บไว้) =====
const carRouter = require("./routes/cars");
app.use("/cars", carRouter);
const driverRouter = require("./routes/drivers");
app.use("/drivers", driverRouter);
const busTypeRouter = require("./routes/bustypes");
app.use("/bustype", busTypeRouter);

// Routers that use the factory pattern
const makeSchedulesRouter = require("./routes/schedules");
const makeDepartmentsRouter = require("./routes/departments");
const makePositionsRouter = require("./routes/positions");
const makePermissionsRouter = require("./routes/permissions");
const makePositionPermissionsRouter = require("./routes/position_permissions");
const makeStopsRouter = require("./routes/stops");
const makeRoutesRouter = require("./routes/routes");
const makeBusRouter = require("./routes/bus");
const makeAuthRouter = require("./routes/auth");
const makeEmployeesRouter = require("./routes/employees");
const makeUserRouter = require("./routes/users");
const makeUserStatusRouter = require("./routes/user_status");
const makeReports1Router = require("./routes/reports1");
const makeReports2Router = require("./routes/report2");
const makeReports3Router = require("./routes/report3");

// ...ประกาศ getConnection() เสร็จแล้วค่อย use()
app.use("/schedules", makeSchedulesRouter(getConnection));
app.use("/departments", makeDepartmentsRouter(getConnection));
app.use("/positions", makePositionsRouter(getConnection));
app.use("/permissions", makePermissionsRouter(getConnection));
app.use("/position-permissions", makePositionPermissionsRouter(getConnection));
app.use("/stops", makeStopsRouter(getConnection));
app.use("/routes", makeRoutesRouter(getConnection));
app.use("/buses", makeBusRouter);
app.use("/auth", makeAuthRouter);
app.use("/employees", makeEmployeesRouter);
app.use("/users", makeUserRouter);
app.use("/user_status", makeUserStatusRouter);
app.use("/reports1", makeReports1Router(getConnection));
app.use("/report2", makeReports2Router);
app.use("/report3", makeReports3Router);

// ===== Oracle Client Config =====

const clientLibDir =
  process.platform === "win32"
    ? "C:\\Oracle\\instantclient_23_9" // <-- ปรับ path ให้ตรงเครื่อง
    : "/opt/oracle/instantclient_11_2"; // <-- สำหรับ Linux

oracledb.initOracleClient({ libDir: clientLibDir });

const dbConfig = {
  user: "DBT68036",
  password: "58141",
  connectString: `(DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCP)(HOST=203.188.54.7)(PORT=1521))
    (CONNECT_DATA=(SID=Database3))
  )`,
};

// ===== Oracle Connection Pool =====
async function initOracle() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Oracle DB connected");
  } catch (err) {
    console.error("❌ Oracle DB connection error:", err);
    process.exit(1);
  }
}

initOracle();

// ===== Error handler & 404 =====
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Ready to handle requests!");
});

// ===== Graceful shutdown =====
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\nShutting down server...");
  process.exit(0);
});
