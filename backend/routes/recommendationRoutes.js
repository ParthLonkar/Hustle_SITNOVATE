import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { 
  generateRecommendation, 
  listRecommendationsForUser, 
  listRecommendationsAll,
  simulateSpoilage,
  trainMlModel,
  getMlFeatures
} from "../controllers/recommendationController.js";

const router = Router();

router.post("/generate", authMiddleware, generateRecommendation);
router.get("/me", authMiddleware, listRecommendationsForUser);
router.get("/all", authMiddleware, roleMiddleware(["admin"]), listRecommendationsAll);

// ML Service endpoints
router.post("/simulate/spoilage", authMiddleware, simulateSpoilage);
router.post("/train/:modelType", authMiddleware, roleMiddleware(["admin"]), trainMlModel);
router.get("/features", authMiddleware, getMlFeatures);

export default router;
