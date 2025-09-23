// routes/employees.js
const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Get all employees with department + position
router.get("/", async (req, res) => {
  const execute = req.app.locals.execute;
  try {
    const result = await execute(
      `SELECT e.employeeid, e.firstname, e.lastname, e.emp_tel,
              e.username, e.password,
              d.deptname, p.positionname
       FROM employees e
       LEFT JOIN departments d ON e.departmentid = d.departmentid
       LEFT JOIN positions p ON e.positionid = p.positionid`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Add new employee
router.post("/new", async (req, res) => {
  const { firstname, lastname, emp_tel, username, password, positionid, departmentid } = req.body;
  const execute = req.app.locals.execute;
  try {
    await execute(
      `INSERT INTO employees (employeeid, firstname, lastname, emp_tel, username, password, positionid, departmentid)
       VALUES (seq_employee.NEXTVAL, :firstname, :lastname, :emp_tel, :username, :password, :positionid, :departmentid)`,
      [firstname, lastname, emp_tel, username, password, positionid, departmentid]
    );
    res.json({ message: "Employee added" });
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({ error: "Failed to add employee" });
  }
});

// Update employee
router.put("/db/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, emp_tel, username, password, positionid, departmentid } = req.body;
  const execute = req.app.locals.execute;
  try {
    await execute(
      `UPDATE employees
       SET firstname=:firstname, lastname=:lastname, emp_tel=:emp_tel,
           username=:username, password=:password,
           positionid=:positionid, departmentid=:departmentid
       WHERE employeeid=:id`,
      [firstname, lastname, emp_tel, username, password, positionid, departmentid, id]
    );
    res.json({ message: "Employee updated" });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// Delete employee
router.delete("/db/:id", async (req, res) => {
  const { id } = req.params;
  const execute = req.app.locals.execute;
  try {
    await execute(`DELETE FROM employees WHERE employeeid=:id`, [id]);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

module.exports = router;
