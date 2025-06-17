// assetController.js
import pool from "../db/connection.js";

// Get all assets for a client
const getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assets WHERE client_id = $1 ORDER BY created_at DESC",
      [req.user.client_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assets." });
  }
};

// Get a single asset by ID
const getAssetById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM assets WHERE id = $1 AND client_id = $2",
      [id, req.user.client_id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Asset not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching asset." });
  }
};

// Create a new asset
const createAsset = async (req, res) => {
  const {
    name,
    category,
    cost,
    purchase_date,
    sale_price,
    sale_date,
    write_off_reason,
    depreciation_method,
    useful_life,
    description,
  } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required." });

  try {
    const result = await pool.query(
      `INSERT INTO assets (
        name, category, cost, purchase_date,
        sale_price, sale_date, write_off_reason,
        depreciation_method, useful_life, description,
        client_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        name,
        category,
        cost,
        purchase_date,
        sale_price,
        sale_date,
        write_off_reason,
        depreciation_method,
        useful_life,
        description,
        req.user.client_id,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting asset:", err);
    res.status(500).json({ message: "Error creating asset." });
  }
};

// Update an asset
const updateAsset = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    cost,
    purchase_date,
    sale_price,
    sale_date,
    write_off_reason,
    depreciation_method,
    useful_life,
    description,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE assets
       SET name = $1, category = $2, cost = $3, purchase_date = $4,
           sale_price = $5, sale_date = $6, write_off_reason = $7,
           depreciation_method = $8, useful_life = $9, description = $10
       WHERE id = $11 AND client_id = $12 RETURNING *`,
      [
        name,
        category,
        cost,
        purchase_date,
        sale_price,
        sale_date,
        write_off_reason,
        depreciation_method,
        useful_life,
        description,
        id,
        req.user.client_id,
      ]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Asset not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating asset." });
  }
};

// Delete an asset
const deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 AND client_id = $2 RETURNING *",
      [id, req.user.client_id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Asset not found." });
    res.json({ message: "Asset deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting asset." });
  }
};

// Export all functions
export default {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
