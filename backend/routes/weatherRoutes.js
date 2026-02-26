import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { listWeather, createWeather } from "../controllers/weatherController.js";

const router = Router();

router.get("/", listWeather);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createWeather);

export default router;
