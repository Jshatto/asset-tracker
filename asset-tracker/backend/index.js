// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("Asset Tracker backend is running! 🚀");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const clientRoutes = require("./routes/clients");
app.use("/api/clients", clientRoutes);
const assetRoutes = require("./routes/assets");
app.use("/api/assets", assetRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const testRoutes = require("./routes/test");
app.use("/api/test", testRoutes);
