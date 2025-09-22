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

// ===== Routes ของ cars และ drivers (เก็บไว้) =====
const carRouter = require("./routes/cars");
app.use("/cars", carRouter);
const driverRouter = require("./routes/drivers");
app.use("/drivers", driverRouter);
const routeRouter = require("./routes/routes");
app.use("/routes", routeRouter);


const makeDepartmentsRouter = require("./routes/departments");
const makePositionsRouter = require("./routes/positions");

// ...ประกาศ getConnection() เสร็จแล้วค่อย use()
app.use("/departments", makeDepartmentsRouter(getConnection));
app.use("/positions", makePositionsRouter(getConnection));

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
    (CONNECT_DATA=(SID=Database))
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

async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (err) {
    console.error("Error getting database connection:", err);
    throw err;
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
