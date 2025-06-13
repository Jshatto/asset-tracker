import pool from "./connection.js";

try {
  await pool.query(`
    ALTER TABLE assets ADD COLUMN IF NOT EXISTS useful_life INTEGER;
  `);

  await pool.query(`
    ALTER TABLE assets ADD COLUMN IF NOT EXISTS depreciation_method TEXT;
  `);

  await pool.query(`
    ALTER TABLE assets ADD COLUMN IF NOT EXISTS description TEXT;
  `);

  console.log("✅ Table updated with new columns");
  process.exit();
} catch (err) {
  console.error("❌ Error updating table:", err.message);
  process.exit(1);
}
