import pool from "../db/connection.js";

const getAllClients = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clients." });
  }
};

const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Client not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client." });
  }
};

const createClient = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Client name is required." });

  try {
    const result = await pool.query(
      "INSERT INTO clients (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error creating client." });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE clients SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Client not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating client." });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Client not found." });
    res.json({ message: "Client deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting client." });
  }
};

export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
