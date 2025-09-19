// server.js
const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Load Thick mode
const clientLibDir =
  process.platform === "win32"
    ? "F:\\year3_term1\\4.MIIC1324 PM\\Lab12\\Oracle\\instantclient_23_9" // <-- change this path
    : "/opt/oracle/instantclient_11_2"; // <-- change for Linux

//F:\year3_term1\4.MIIC1324 PM\Lab12\Oracle
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

async function initOracle() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Oracle DB connected");
  } catch (err) {
    console.error("❌ Oracle DB connection error:", err);
    process.exit(1);
  }
}

app.get("/employee1", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`SELECT * FROM employee`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

initOracle().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// ✅ Fetch employees
app.get("/employees", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT EmpId, EmpName, EmpAddress, Salary FROM Employee order by EmpId`
    );
    const employees = result.rows.map((row) => ({
      EmpId: row[0],
      EmpName: row[1],
      EmpAddress: row[2],
      Salary: row[3],
    }));
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  } finally {
    if (connection) await connection.close();
  }
});

// 🔹 Create employee with auto ID
app.post("/employees", async (req, res) => {
  const { EmpName, EmpAddress, Salary } = req.body; // no EmpId input

  let connection;
  try {
    connection = await oracledb.getConnection();

    // 1. Find max current EmpId
    const result = await connection.execute(`SELECT MAX(EmpId) FROM Employee`);

    let newId = "EMP001"; // default if no record
    if (result.rows[0][0]) {
      const lastId = result.rows[0][0]; // e.g. "EMP005"
      const num = parseInt(lastId.replace("EMP", "")) + 1;
      newId = "EMP" + num.toString().padStart(3, "0");
    }

    // 2. Insert employee
    await connection.execute(
      `INSERT INTO Employee (EmpId, EmpName, EmpAddress, Salary)
       VALUES (:EmpId, :EmpName, :EmpAddress, :Salary)`,
      { EmpId: newId, EmpName, EmpAddress, Salary },
      { autoCommit: true }
    );

    res.json({ message: "Employee inserted successfully!", EmpId: newId });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Insert Error");
  } finally {
    if (connection) await connection.close();
  }
});

// 🔹 Update employee
app.put("/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { EmpName, EmpAddress, Salary } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute(
      `UPDATE Employee
       SET EmpName = :EmpName, EmpAddress = :EmpAddress, Salary = :Salary
       WHERE EmpId = :id`,
      { EmpName, EmpAddress, Salary, id },
      { autoCommit: true }
    );
    res.json({ message: "Employee updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Update Error");
  } finally {
    if (connection) await connection.close();
  }
});

// 🔹 Delete employee
app.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute(
      `DELETE FROM Employee WHERE EmpId = :id`,
      { id },
      { autoCommit: true }
    );
    res.json({ message: "Employee deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Delete Error");
  } finally {
    if (connection) await connection.close();
  }
});
