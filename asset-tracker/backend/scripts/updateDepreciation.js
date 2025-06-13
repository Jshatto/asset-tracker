const pool = require("../db/connection");
const { calculateStraightLineDepreciation } = require("../utils/depreciation");

async function updateAllDepreciation() {
  try {
    const result = await pool.query("SELECT * FROM assets");

    for (const asset of result.rows) {
      const newValue = calculateStraightLineDepreciation(asset);

      await pool.query(
        "UPDATE assets SET accumulated_depreciation = $1 WHERE id = $2",
        [newValue, asset.id]
      );
    }

    console.log("✅ Depreciation updated for all assets.");
  } catch (err) {
    console.error("❌ Error updating depreciation:", err.message);
  } finally {
    pool.end(); // cleanly close connection
  }
}

updateAllDepreciation();
