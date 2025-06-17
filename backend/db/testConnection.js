import pool from "./connection.js";

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to DB at:", result.rows[0].now);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  } finally {
    pool.end();
  }
};

testConnection();
