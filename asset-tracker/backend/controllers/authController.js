const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/connection");

async function registerUser(req, res) {
  const { email, password, role, client_id } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

   const result = await pool.query(
  `INSERT INTO users (email, password, role, client_id)
   VALUES ($1, $2, $3, $4) RETURNING id, email, role, client_id, created_at`,
  [email, hashedPassword, role || "client", client_id || null]
);

    const newUser = result.rows[0];
    res.status(201).json({ user: newUser });
  } catch (err) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Email already exists." });
    } else {
      console.error(err);
      res.status(500).json({ message: "Server error." });
    }
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, client_id: user.client_id, },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
}

// ✅ Export both functions now:
module.exports = {
  registerUser,
  loginUser,
};
