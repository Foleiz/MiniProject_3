// routes/auth.js
const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const execute = req.app.locals.execute;

  try {
    // 1️⃣ Get user info and position ID
    const userResult = await execute(
      `SELECT em.employeeid, em.username, em.positionid, p.positionname, d.deptname
       FROM Employees em
       JOIN positions p ON em.positionid = p.positionid
       LEFT JOIN departments d ON em.departmentid = d.departmentid
       WHERE em.username = :username AND em.password = :password`,
      [username, password],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Correctly check the length of the 'rows' array
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Correctly get the user from the 'rows' array
    const user = userResult.rows[0];

    // 2️⃣ Get permissions for this user's position
    const permResult = await execute(
      `SELECT p.permissionname
       FROM positionpermissions pp
       JOIN permissions p ON pp.permissionid = p.permissionid
       WHERE pp.positionid = :positionId`,
      [user.POSITIONID], // The property name `POSITIONID` is correct
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const permissions = permResult.rows.map((row) => row.PERMISSIONNAME); // Correctly map over 'rows'

    // 3️⃣ Return user info + permissions
    res.json({
      user: {
        id: user.EMPLOYEEID,
        username: user.USERNAME,
        position: user.POSITIONNAME,
        department: user.DEPTNAME,
      },
      permissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
