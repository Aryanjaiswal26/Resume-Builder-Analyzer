import express from "express";
import {
  createResume,
  deleteResume,
  generateBullets,
  getResumeById,
  getResumes,
  updateResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.route("/").post(createResume).get(getResumes);
router.route("/:id").get(getResumeById).put(updateResume).delete(deleteResume);
router.post("/generate-bullets", generateBullets);

export default router;
