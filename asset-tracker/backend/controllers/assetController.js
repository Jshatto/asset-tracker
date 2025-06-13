const pool = require("../db/connection");
const { calculateStraightLineDepreciation } = require("../utils/depreciation");

// GET /api/assets
async function getAllAssets(req, res) {
  try {
    let result;

    if (req.user.role === "admin") {
      result = await pool.query("SELECT * FROM assets ORDER BY created_at DESC");
    } else {
      result = await pool.query(
        "SELECT * FROM assets WHERE client_id = $1 ORDER BY created_at DESC",
        [req.user.client_id]
      );
    }

    // Add depreciation to each asset
    for (let asset of result.rows) {
      asset.accumulated_depreciation = calculateStraightLineDepreciation(asset);
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assets." });
  }
}

// GET /api/assets/:id
async function getAssetById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM assets WHERE id = $1", [id]);
    const asset = result.rows[0];

    if (!asset) return res.status(404).json({ message: "Asset not found." });
    if (req.user.role !== "admin" && asset.client_id !== req.user.client_id) {
      return res.status(403).json({ message: "Forbidden. Not your asset." });
    }

    asset.accumulated_depreciation = calculateStraightLineDepreciation(asset);
    res.json(asset);
  } catch (err) {
    res.status(500).json({ message: "Error fetching asset." });
  }
}

// POST /api/assets
async function createAsset(req, res) {
  const {
    name,
    category,
    cost,
    purchase_date,
    sale_price,
    sale_date,
    write_off_reason,
    client_id,
    useful_life,
    depreciation_start,
  } = req.body;

  const effectiveClientId = req.user.role === "admin" ? client_id : req.user.client_id;

  if (!name || !effectiveClientId) {
    return res.status(400).json({ message: "Name and client ID are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO assets (
        name, category, cost, purchase_date, sale_price, sale_date, write_off_reason,
        client_id, useful_life, depreciation_start
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        name, category, cost, purchase_date, sale_price, sale_date,
        write_off_reason, effectiveClientId, useful_life || 5,
        depreciation_start || purchase_date
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating asset.", error: err.message });
  }
}

// PUT /api/assets/:id
async function updateAsset(req, res) {
  const { id } = req.params;
  const {
    name,
    category,
    cost,
    purchase_date,
    sale_price,
    sale_date,
    write_off_reason,
    client_id,
    useful_life,
    depreciation_start
  } = req.body;

  try {
    const check = await pool.query("SELECT client_id FROM assets WHERE id = $1", [id]);
    if (!check.rows.length) return res.status(404).json({ message: "Asset not found." });
    if (req.user.role !== "admin" && check.rows[0].client_id !== req.user.client_id) {
      return res.status(403).json({ message: "Forbidden. Not your asset." });
    }

    const result = await pool.query(
      `UPDATE assets
       SET name = $1, category = $2, cost = $3, purchase_date = $4,
           sale_price = $5, sale_date = $6, write_off_reason = $7,
           client_id = $8, useful_life = $9, depreciation_start = $10
       WHERE id = $11 RETURNING *`,
      [
        name, category, cost, purchase_date, sale_price, sale_date, write_off_reason,
        req.user.role === "admin" ? client_id : req.user.client_id,
        useful_life || 5,
        depreciation_start || purchase_date,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating asset." });
  }
}

// DELETE /api/assets/:id
async function deleteAsset(req, res) {
  const { id } = req.params;
  try {
    const check = await pool.query("SELECT client_id FROM assets WHERE id = $1", [id]);
    if (!check.rows.length) return res.status(404).json({ message: "Asset not found." });
    if (req.user.role !== "admin" && check.rows[0].client_id !== req.user.client_id) {
      return res.status(403).json({ message: "Forbidden. Not your asset." });
    }

    await pool.query("DELETE FROM assets WHERE id = $1", [id]);
    res.json({ message: "Asset deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting asset." });
  }
}

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
