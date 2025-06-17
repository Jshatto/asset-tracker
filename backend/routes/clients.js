// clients.js (routes)
import express from "express";
import clientController from "../controllers/clientController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all client routes
router.use(authMiddleware);

router.get("/", clientController.getAllClients);
router.get("/:id", clientController.getClientById);
router.post("/", clientController.createClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

export default router;
