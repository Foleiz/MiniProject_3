const oracledb = require("oracledb");

// Oracle DB config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
};

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

module.exports = { dbConfig,execute };