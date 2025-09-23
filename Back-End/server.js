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

<<<<<<< Updated upstream
async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (err) {
    console.error("Error getting database connection:", err);
    throw err;
  }
}

// ===== Routes ของ cars และ drivers (เก็บไว้) =====
const carRouter = require("./routes/cars");
app.use("/cars", carRouter);
const driverRouter = require("./routes/drivers");
app.use("/drivers", driverRouter);
const routeRouter = require("./routes/routes");
app.use("/routes", routeRouter);
const scheduleRouter = require("./routes/schedules");
app.use("/schedules", scheduleRouter);
//============Bouquet==========

const makeDepartmentsRouter = require("./routes/departments");
const makePositionsRouter = require("./routes/positions");
const makePermissionsRouter = require("./routes/permissions");
const makePositionPermissionsRouter = require("./routes/position_permissions");

// ...ประกาศ getConnection() เสร็จแล้วค่อย use()
app.use("/departments", makeDepartmentsRouter(getConnection));
app.use("/positions", makePositionsRouter(getConnection));
app.use("/permissions", makePermissionsRouter(getConnection));
app.use("/position-permissions", makePositionPermissionsRouter(getConnection));

// ===== Oracle Client Config =====
=======
// BUSTYPE API (ต้องอยู่หลัง app ถูกสร้าง)
const bustypeRouter = require("./routes/bustypes");
app.use("/bustypes", bustypeRouter);

>>>>>>> Stashed changes

const clientLibDir =
  process.platform === "win32"
    ? "C:\\Oracle\\instantclient_23_9" // <-- ปรับ path ให้ตรงเครื่อง
    : "/opt/oracle/instantclient_11_2"; // <-- สำหรับ Linux

oracledb.initOracleClient({ libDir: clientLibDir });

<<<<<<< Updated upstream
=======

// Oracle DB config
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// ===== Start server =====
=======
app.put("/positions/:id", async (req, res) => {
  const { id } = req.params;
  const { position_name } = req.body;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE positions SET position_name = :position_name WHERE position_id = :id`,
      [position_name, id],
      { autoCommit: true }
    );
    res.send("Position updated successfully");
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating position");
  }
});

app.delete("/positions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `DELETE FROM positions WHERE position_id = :id`,
      [id],
      { autoCommit: true }
    );
    res.send("Position deleted successfully");
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting position");
  }
});

// Routes for Department (แผนก)
app.get("/departments", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM departments");
    res.json(result.rows);
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching departments");
  }
});

app.post("/departments", async (req, res) => {
  const { department_id, department_name } = req.body;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `INSERT INTO departments (department_id, department_name) VALUES (:department_id, :department_name)`,
      [department_id, department_name],
      { autoCommit: true }
    );
    res.status(201).send("Department added successfully");
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding department");
  }
});

app.put("/departments/:id", async (req, res) => {
  const { id } = req.params;
  const { department_name } = req.body;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE departments SET department_name = :department_name WHERE department_id = :id`,
      [department_name, id],
      { autoCommit: true }
    );
    res.send("Department updated successfully");
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating department");
  }
});

app.delete("/departments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `DELETE FROM departments WHERE department_id = :id`,
      [id],
      { autoCommit: true }
    );
    res.send("Department deleted successfully");
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting department");
  }
});



// ROUTE API
const routeRouter = require("./routes/routes");
app.use("/routes", routeRouter);

// CAR API
const carRouter = require("./routes/cars");
app.use("/cars", carRouter);

// DRIVER API
const driverRouter = require("./routes/drivers");
app.use("/drivers", driverRouter);

// Start the server
>>>>>>> Stashed changes
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
