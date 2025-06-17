// routes/assets.js
import express from "express";
import assetController from "../controllers/assetController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all asset routes
router.use(authMiddleware);

router.get("/", assetController.getAllAssets);
router.get("/:id", assetController.getAssetById);
router.post("/", assetController.createAsset);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);

export default router;
