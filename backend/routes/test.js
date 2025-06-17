import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Example: Protected test route
router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "✅ Protected route reached",
    user: req.user,
  });
});

export default router;
