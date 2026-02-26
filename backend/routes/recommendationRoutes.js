import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { generateRecommendation, listRecommendationsForUser, listRecommendationsAll } from "../controllers/recommendationController.js";

const router = Router();

router.post("/generate", authMiddleware, generateRecommendation);
router.get("/me", authMiddleware, listRecommendationsForUser);
router.get("/all", authMiddleware, roleMiddleware(["admin"]), listRecommendationsAll);

export default router;
