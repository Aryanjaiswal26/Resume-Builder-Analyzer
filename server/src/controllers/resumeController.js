import Resume from "../models/Resume.js";
import { getOpenAIClient } from "../utils/openaiClient.js";

export const createResume = async (req, res) => {
  const resume = await Resume.create({ ...req.body, userId: req.user._id });
  res.status(201).json(resume);
};

export const getResumes = async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  res.json(resumes);
};

export const getResumeById = async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ message: "Resume not found." });
  res.json(resume);
};

export const updateResume = async (req, res) => {
  const resume = await Resume.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
  if (!resume) return res.status(404).json({ message: "Resume not found." });
  res.json(resume);
};

export const deleteResume = async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ message: "Resume not found." });
  res.json({ message: "Resume deleted successfully." });
};

export const generateBullets = async (req, res) => {
  const client = getOpenAIClient();
  const { role, company, jobDescription } = req.body;
  const prompt = `Generate 5 ATS-friendly concise resume bullet points for role "${role}" at "${company}". Job details: ${jobDescription}. Return as JSON array of strings.`;
  const completion = await client.responses.create({
    model: process.env.AI_MODEL || "gemini-1.5-flash",
    input: prompt,
  });
  const text = completion.output_text || "[]";
  res.json({ bullets: text });
};
