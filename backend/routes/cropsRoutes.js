import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { listCrops, createCrop, updateCrop, deleteCrop } from "../controllers/cropsController.js";

const router = Router();

router.get("/", listCrops);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCrop);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateCrop);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteCrop);

export default router;
