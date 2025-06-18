// assetController.js
import pool from "../db/connection.js";

// Get all assets for a client
const getAllAssets = async (req, res) => {
  try {
    const { role, client_id } = req.user;

    let result;
    // In getAllAssets:
if (role === "admin") {
  result = await pool.query(
    "SELECT * FROM assets WHERE archived = FALSE ORDER BY created_at DESC"
  );
} else {
  result = await pool.query(
    "SELECT * FROM assets WHERE client_id = $1 AND archived = FALSE ORDER BY created_at DESC",
    [client_id]
  );
}


    res.json(result.rows);
  } catch (err) {
    console.error("Error in getAllAssets:", err);
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
// Soft-delete (archive) an asset
const deleteAsset = async (req, res) => {
  const { id } = req.params;
  const { role, client_id } = req.user;

  try {
    let result;
    if (role === "admin") {
      // Admin can archive any asset
      result = await pool.query(
        "UPDATE assets SET archived = TRUE WHERE id = $1 RETURNING *",
        [id]
      );
    } else {
      // Client can only archive their own
      result = await pool.query(
        "UPDATE assets SET archived = TRUE WHERE id = $1 AND client_id = $2 RETURNING *",
        [id, client_id]
      );
    }

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ message: "Asset not found or not permitted." });
    }

    res.json({ message: "Asset archived.", asset: result.rows[0] });
  } catch (err) {
    console.error("Error archiving asset:", err);
    res.status(500).json({ message: "Error archiving asset." });
  }
};


 // Import multiple assets from CSV
const importAssets = async (req, res) => {
  const rows = req.body;
  const client_id = req.user.client_id;

  // 1. Basic validation
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: "No asset data provided" });
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query("BEGIN");

    for (const row of rows) {
      const {
        name,
        cost,
        purchase_date,
        category,
        useful_life,
        depreciation_method,
        description, // optional
      } = row;

      // 2. Validate required fields per row
      if (
        !name ||
        cost == null ||
        !purchase_date ||
        !category ||
        useful_life == null ||
        !depreciation_method
      ) {
        throw new Error(
          `Missing required field in one of the rows: ${JSON.stringify(row)}`
        );
      }

      // 3. Insert each asset
      await dbClient.query(
        `INSERT INTO assets
          (name, cost, purchase_date, category,
           useful_life, depreciation_method, description, client_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          name,
          cost,
          purchase_date,
          category,
          useful_life,
          depreciation_method,
          description || null,
          client_id,
        ]
      );
    }

    await dbClient.query("COMMIT");
    res.json({ message: "Assets imported successfully" });
  } catch (err) {
    await dbClient.query("ROLLBACK");
    console.error("Error importing assets:", err);
    res
      .status(500)
      .json({ message: err.message || "Error importing assets" });
  } finally {
    dbClient.release();
  }
};
// Export non-archived assets as CSV
import { Parser } from "json2csv";  // at the top with other imports

const exportAssets = async (req, res) => {
  try {
    // Fetch all non-archived assets (admins get all; clients only theirs)
    const { role, client_id } = req.user;
    const baseQuery = `
      SELECT id, name, category, cost, purchase_date,
             depreciation_method, useful_life, description
      FROM assets
      WHERE archived = FALSE
    `;
    const query = role === "admin"
      ? baseQuery
      : baseQuery + " AND client_id = $1";
    const params = role === "admin" ? [] : [client_id];

    const result = await pool.query(query, params);
    const fields = [
      "id", "name", "category", "cost",
      "purchase_date", "depreciation_method",
      "useful_life", "description"
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment("assets.csv");
    res.send(csv);
  } catch (err) {
    console.error("Error exporting assets:", err);
    res.status(500).json({ message: "Error exporting assets." });
  }
};


// Export all functions
export default {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  importAssets
};
