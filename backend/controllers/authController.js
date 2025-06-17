// authController.js
import pool from "../db/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const { email, password, role, client_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    let clientId;
    if (role === "client" && client_name) {
      const clientResult = await pool.query(
        "INSERT INTO clients (name) VALUES ($1) RETURNING id",
        [client_name]
      );
      clientId = clientResult.rows[0].id;
    }

    const userResult = await pool.query(
      `INSERT INTO users (email, password, role, client_id)
       VALUES ($1, $2, $3, $4) RETURNING id, email, role, client_id`,
      [email, hashedPassword, role || "admin", clientId || null]
    );

    const user = userResult.rows[0];
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
};
export const deleteAsset = async (req, res) => {
  const { id } = req.params;
  const client_id = req.user.client_id;

  try {
    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 AND client_id = $2 RETURNING *",
      [id, client_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Asset not found or unauthorized" });
    }
    res.json({ message: "Asset deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting asset" });
  }
};

export default { register, login };
