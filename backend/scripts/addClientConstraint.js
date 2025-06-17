import pool from "../db/connection.js";

const addClientUniqueConstraint = async () => {
  try {
    const check = await pool.query(`
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'clients'
      AND constraint_name = 'unique_client_name';
    `);

    if (check.rowCount === 0) {
      await pool.query(`
        ALTER TABLE clients
        ADD CONSTRAINT unique_client_name UNIQUE (name);
      `);
      console.log("✅ UNIQUE constraint added to clients.name");
    } else {
      console.log("ℹ️ Constraint already exists — nothing to do.");
    }
  } catch (err) {
    console.error("❌ Error adding constraint:", err.message);
  } finally {
    pool.end();
  }
};

addClientUniqueConstraint();
