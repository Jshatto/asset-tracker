import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import assetRoutes from "./routes/assets.js";
import pool from "./db/connection.js";
import testRoutes from "./routes/test.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/test", testRoutes);

// Root endpoint (optional test)
app.get("/", (req, res) => {
  res.send("✅ API is working!");
});

// Start server after DB check
pool.connect()
  .then(() => {
    console.log("✅ Connected to database");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
  });
