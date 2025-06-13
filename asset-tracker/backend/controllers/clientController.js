const pool = require("../db/connection");

async function getAllClients(req, res) {
  try {
    const result = await pool.query("SELECT * FROM clients ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching clients." });
  }
}

async function getClientById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    const client = result.rows[0];

    if (!client) return res.status(404).json({ message: "Client not found." });

    // 🔐 Restrict access if not admin
    if (req.user.role !== "admin" && req.user.client_id !== client.id) {
      return res.status(403).json({ message: "Access denied. Not your client." });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client." });
  }
}

async function createClient(req, res) {
  const { name, contact_info } = req.body;
  if (!name) return res.status(400).json({ message: "Client name is required." });

  try {
    const result = await pool.query(
      "INSERT INTO clients (name, contact_info) VALUES ($1, $2) RETURNING *",
      [name, contact_info || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating client." });
  }
}

async function updateClient(req, res) {
  const { id } = req.params;
  const { name, contact_info } = req.body;

  try {
    const result = await pool.query(
      "UPDATE clients SET name = $1, contact_info = $2 WHERE id = $3 RETURNING *",
      [name, contact_info || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Client not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating client." });
  }
}

async function deleteClient(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Client not found." });
    res.json({ message: "Client deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting client." });
  }
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
