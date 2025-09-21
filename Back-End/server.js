
const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const carRouter = require("./routes/cars");
app.use("/cars", carRouter);

const driverRouter = require("./routes/drivers");
app.use("/drivers", driverRouter);

const clientLibDir =
  process.platform === "win32"
    ? "C:\\oracle\\instantclient_23_9" // <-- change this path
    : "/opt/oracle/instantclient_11_2"; // <-- change for Linux
 
oracledb.initOracleClient({ libDir: clientLibDir });

// Oracle DB config
const dbConfig = {
  user: "DBT68036",
  password: "58141",
  connectString: `(DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCP)(HOST=203.188.54.7)(PORT=1521))
    (CONNECT_DATA=(SID=Database))
  )`,
};

// Initialize Oracle connection pool
async function initOracle() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("Oracle DB connected");
  } catch (err) {
    console.error("Oracle DB connection error:", err);
    process.exit(1);
  }
}

initOracle();

// Routes for Position (ตำแหน่ง)
app.get("/positions", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM positions");
    res.json(result.rows);
    connection.close(); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching positions");
  }
});

app.post("/positions", async (req, res) => {
  const { position_id, position_name } = req.body;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `INSERT INTO positions (position_id, position_name) VALUES (:position_id, :position_name)`,
      [position_id, position_name],
      { autoCommit: true }
    );
    res.status(201).send("Position added successfully");
    connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding position");
  }
});

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
