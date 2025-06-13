const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require("../controllers/assetController");

router.get("/", authenticateToken, getAllAssets);
router.get("/:id", authenticateToken, getAssetById);
router.post("/", authenticateToken, createAsset);
router.put("/:id", authenticateToken, updateAsset);
router.delete("/:id", authenticateToken, deleteAsset);

module.exports = router;
