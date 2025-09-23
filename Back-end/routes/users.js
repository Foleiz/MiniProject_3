// routes/users.js
const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

// Get all users with status name
router.get("/", async (req, res) => {
  const execute = req.app.locals.execute;
  try {
    const result = await execute(
      `SELECT u.userid AS USERID, 
              u.firstname AS FIRSTNAME, 
              u.lastname AS LASTNAME, 
              u.user_tel AS USER_TEL,
              u.statusid AS STATUSID,  -- 🔧 ADD THIS TO GET THE NUMERIC ID
              u.username AS USERNAME, 
              u.password AS PASSWORD,
              s.statusname AS STATUSNAME
       FROM user_account u
       LEFT JOIN userstatus s ON u.statusid = s.userstatusid`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Add new user
router.post("/new", async (req, res) => {
  const { firstname, lastname, user_tel, username, password, statusid } = req.body;
  const execute = req.app.locals.execute;
  
  try {
    await execute(
      `INSERT INTO user_account (userid, firstname, lastname, user_tel, username, password, statusid)
       VALUES (seq_user.NEXTVAL, :firstname, :lastname, :user_tel, :username, :password, :statusid)`,
      {
        firstname: firstname,
        lastname: lastname, 
        user_tel: user_tel,
        username: username,
        password: password,
        statusid: parseInt(statusid) // 🔧 ENSURE IT'S A NUMBER
      }
    );
    res.json({ message: "User added" });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// Update user
router.put("/db/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, user_tel, username, password, statusid } = req.body;
  const execute = req.app.locals.execute;
  
  try {
    await execute(
      `UPDATE user_account
       SET firstname=:firstname, lastname=:lastname, user_tel=:user_tel,
           username=:username, password=:password, statusid=:statusid
       WHERE userid=:id`,
      {
        firstname: firstname,
        lastname: lastname,
        user_tel: user_tel,
        username: username,
        password: password,
        statusid: parseInt(statusid), // 🔧 ENSURE IT'S A NUMBER
        id: parseInt(id) // 🔧 ENSURE IT'S A NUMBER
      }
    );
    res.json({ message: "User updated" });
  } catch (err) {
    console.error("Error updating user:", err);
    console.error("Query parameters were:", {
      firstname, lastname, user_tel, username, password, 
      statusid: parseInt(statusid), 
      id: parseInt(id)
    });
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/db/:id", async (req, res) => {
  const { id } = req.params;
  const execute = req.app.locals.execute;
  try {
    await execute(`DELETE FROM user_account WHERE userid=:id`, {
      id: parseInt(id) // 🔧 ENSURE IT'S A NUMBER
    });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;