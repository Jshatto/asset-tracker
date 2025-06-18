// routes/assets.js
import express from "express";
import assetController from "../controllers/assetController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import assetController from "../controllers/assetController.js";
// (ensure Parser import is in the controller)


const router = express.Router();

// Protect all asset routes
router.use(authMiddleware);

router.get("/", assetController.getAllAssets);
router.get("/:id", assetController.getAssetById);
router.post("/", assetController.createAsset);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);
// Download assets as CSV
router.get("/export", assetController.exportAssets);


// Import multiple assets from CSV
router.post(
  "/import",
  authMiddleware,
  assetController.importAssets
);
export default router;
