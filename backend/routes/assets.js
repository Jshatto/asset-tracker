import express from "express";
import assetController from "../controllers/assetController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all asset routes
router.use(authMiddleware);

// 1. Export CSV must come before the `/:id` route
router.get("/export", assetController.exportAssets);

// 2. Import CSV
router.post("/import", assetController.importAssets);

// 3. Standard RESTful routes
router.get("/", assetController.getAllAssets);
router.get("/:id", assetController.getAssetById);
router.post("/", assetController.createAsset);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);

export default router;
