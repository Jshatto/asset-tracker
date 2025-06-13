const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

router.get("/protected", authenticateToken, (req, res) => {
  res.json({
    message: "✅ You accessed a protected route!",
    user: req.user,
      });
      const isAdmin = require("../middleware/isAdmin");

router.get("/admin-only", authenticateToken, isAdmin, (req, res) => {
  res.json({ message: "🛡️ Admin-only route accessed", user: req.user });
});

});

module.exports = router;
