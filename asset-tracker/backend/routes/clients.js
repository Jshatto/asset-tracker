const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

// All routes are protected
router.get("/", authenticateToken, getAllClients);
router.get("/:id", authenticateToken, getClientById);
router.post("/", authenticateToken, createClient);
router.put("/:id", authenticateToken, updateClient);
router.delete("/:id", authenticateToken, deleteClient);

module.exports = router;
