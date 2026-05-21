import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
    score: { type: Number, required: true },
    feedback: {
      strengths: [String],
      weaknesses: [String],
      missingKeywords: [String],
    },
    suggestions: [String],
    jobMatch: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Analysis = mongoose.model("Analysis", analysisSchema);
export default Analysis;
