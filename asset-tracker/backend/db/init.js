const pool = require("./connection");
const fs = require("fs");

const sql = fs.readFileSync(__dirname + "/init.sql", "utf8");

pool.query(sql)
  .then(() => {
    console.log("✅ Users table created.");
    pool.end();
  })
  .catch((err) => {
    console.error("❌ Error creating table:", err);
    pool.end();
  });
