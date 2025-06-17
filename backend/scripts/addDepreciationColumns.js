import pool from "../db/connection.js";

async function addDepreciationColumns() {
  try {
    await pool.query(`
      ALTER TABLE assets
      ADD COLUMN IF NOT EXISTS useful_life INTEGER DEFAULT 5,
      ADD COLUMN IF NOT EXISTS depreciation_start DATE,
      ADD COLUMN IF NOT EXISTS depreciation_method TEXT DEFAULT 'straight_line',
      ADD COLUMN IF NOT EXISTS accumulated_depreciation NUMERIC(12,2) DEFAULT 0
    `);
    console.log("✅ Depreciation columns added.");
  } catch (err) {
    console.error("❌ Failed to alter table:", err.message);
  } finally {
    pool.end();
  }
}

addDepreciationColumns();
