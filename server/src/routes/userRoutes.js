import express from "express";
import { getProfile, updateProfileImage } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/profile", getProfile);
router.put("/avatar", upload.single("avatar"), updateProfileImage);

export default router;
