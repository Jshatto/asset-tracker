// scripts/createTestUser.js
import bcrypt from "bcryptjs";
import pool from "../db/connection.js"; // adjust if your connection file is elsewhere

(async () => {
  try {
    const email = "testclient@example.com";
    const plain = "ClientPass123";
    const role = "client";
    const client_id = 3;

    // Hash password
    const hashed = await bcrypt.hash(plain, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password, role, client_id)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, role, client_id`,
      [email, hashed, role, client_id]
    );

    console.log("Created user:", result.rows[0]);
  } catch (err) {
    console.error("Error creating test user:", err);
  } finally {
    await pool.end();
  }
})();
