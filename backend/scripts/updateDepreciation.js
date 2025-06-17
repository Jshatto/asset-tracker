// scripts/updateDepreciation.js
import pool from "../db/connection.js";

const updateDepreciation = async () => {
  try {
    const result = await pool.query("SELECT * FROM assets WHERE useful_life IS NOT NULL AND cost IS NOT NULL");
    const assets = result.rows;

    for (const asset of assets) {
      const annualDepreciation = Number(asset.cost) / Number(asset.useful_life);
      const now = new Date();
      const purchased = new Date(asset.purchase_date);
      const yearsElapsed = Math.floor((now - purchased) / (1000 * 60 * 60 * 24 * 365));
      const accumulated = Math.min(annualDepreciation * yearsElapsed, asset.cost);

      await pool.query(
        `UPDATE assets SET accumulated_depreciation = $1 WHERE id = $2`,
        [accumulated, asset.id]
      );
    }

    console.log("✅ Depreciation updated for all assets.");
    process.exit();
  } catch (err) {
    console.error("❌ Error updating depreciation:", err);
    process.exit(1);
  }
};

updateDepreciation();
