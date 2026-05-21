import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required." });
  const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "ai-resume-builder/avatars" });
  const updated = await User.findByIdAndUpdate(req.user._id, { avatar: uploadResult.secure_url }, { new: true }).select(
    "-password"
  );
  res.json(updated);
};
