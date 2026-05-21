import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Resume" },
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      summary: String,
      linkedin: String,
      github: String,
      links: [String],
    },
    education: [{ school: String, degree: String, year: String, cgpa: String, startDate: String, endDate: String, description: String }],
    experience: [{ company: String, role: String, startDate: String, endDate: String, bullets: [String] }],
    skills: [String],
    projects: [{ name: String, description: String, technologies: [String], github: String, live: String, link: String }],
    achievements: [String],
    certifications: [String],
    template: { type: String, default: "modern" },
    atsScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
