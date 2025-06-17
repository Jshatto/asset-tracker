import pool from "../db/connection.js";

const addClientUniqueConstraint = async () => {
  try {
    await pool.query(`
      ALTER TABLE clients
      ADD CONSTRAINT IF NOT EXISTS unique_client_name UNIQUE (name);
    `);
    console.log("✅ UNIQUE constraint added to clients.name");
  } catch (err) {
    console.error("❌ Error adding constraint:", err.message);
  } finally {
    pool.end();
  }
};

addClientUniqueConstraint();
