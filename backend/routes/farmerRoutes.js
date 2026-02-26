import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { getMe } from "../controllers/farmerController.js";

const router = Router();

router.get("/me", authMiddleware, getMe);

router.get("/admin/summary", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Admin-only summary endpoint." });
});

export default router;
