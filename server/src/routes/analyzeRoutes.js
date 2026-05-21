import express from "express";
import { analyzeResume, improveResume } from "../controllers/analyzeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.post("/", upload.single("resume"), analyzeResume);
router.post("/improve", improveResume);

export default router;
