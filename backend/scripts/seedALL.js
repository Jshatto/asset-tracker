import pool from "../db/connection.js";
import bcrypt from "bcryptjs";

const seedAll = async () => {
  try {
    // Hash password
    const hashed = await bcrypt.hash("password123", 10);

 // Insert admin user
    const userResult = await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ('admin@example.com', $1, 'admin')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [hashed]
    );
    const adminId = userResult.rows[0]?.id;

    // Insert client
    const clientResult = await pool.query(
      `INSERT INTO clients (name)
       VALUES ('Test Client')
       ON CONFLICT (name) DO NOTHING
       RETURNING id`
    );
    const clientId = clientResult.rows[0]?.id;

    // Assign admin to client if missing
    if (adminId && clientId) {
      await pool.query(
        "UPDATE users SET client_id = $1 WHERE id = $2",
        [clientId, adminId]
      );
    }

    // Insert sample assets
    await pool.query(
      `INSERT INTO assets (
        name, category, cost, purchase_date,
        depreciation_method, useful_life, client_id
      ) VALUES
        ('Laptop', 'Equipment', 1200, '2022-01-01', 'straight_line', 3, $1),
        ('Office Chair', 'Furniture', 300, '2023-06-15', 'straight_line', 5, $1)
      ON CONFLICT DO NOTHING`,
      [clientId]
    );

    console.log("✅ Seeded user, client, and assets.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    pool.end();
  }
};

seedAll();
