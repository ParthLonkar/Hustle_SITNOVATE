import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { listActions, createAction } from "../controllers/preservationController.js";

const router = Router();

router.get("/", listActions);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createAction);

export default router;
