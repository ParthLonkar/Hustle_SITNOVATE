import { Router } from "express";
import { summaryStats } from "../controllers/statsController.js";

const router = Router();

router.get("/summary", summaryStats);

export default router;
