import fs from "fs";
import { PDFParse } from "pdf-parse";
import Analysis from "../models/Analysis.js";
import Resume from "../models/Resume.js";
import { getOpenAIClient } from "../utils/openaiClient.js";

const safeJSON = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const stripCodeFences = (text = "") =>
  text.replace(/```json/gi, "").replace(/```/g, "").trim();

const extractAIText = (completion) => {
  if (completion?.output_text) return completion.output_text;
  const content = completion?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const textPart = content.find((part) => part?.type === "output_text" || part?.type === "text");
    return textPart?.text || "";
  }
  return "";
};

const normalizeToSourceShape = (source, candidate) => {
  if (typeof source === "string") {
    return typeof candidate === "string" && candidate.trim() ? candidate : source;
  }

  if (Array.isArray(source)) {
    if (!Array.isArray(candidate)) return source;
    return source.map((sourceItem, index) =>
      normalizeToSourceShape(sourceItem, candidate[index])
    );
  }

  if (source && typeof source === "object") {
    const normalized = {};
    for (const key of Object.keys(source)) {
      normalized[key] = normalizeToSourceShape(source[key], candidate?.[key]);
    }
    return normalized;
  }

  return source;
};

const resumeSchemaShape = {
  title: "",
  template: "modern-minimal",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    links: [],
  },
  education: [{ school: "", degree: "", year: "", cgpa: "", startDate: "", endDate: "", description: "" }],
  experience: [{ company: "", role: "", startDate: "", endDate: "", bullets: [""] }],
  projects: [{ name: "", description: "", technologies: [], github: "", live: "", link: "" }],
  skills: [],
  achievements: [],
  certifications: [],
};

const coerceToSchemaShape = (shape, candidate) => {
  if (typeof shape === "string") return typeof candidate === "string" ? candidate : shape;

  if (Array.isArray(shape)) {
    if (!Array.isArray(candidate)) return [];
    if (shape.length === 0) return candidate;
    return candidate.map((item) => coerceToSchemaShape(shape[0], item));
  }

  if (shape && typeof shape === "object") {
    const output = {};
    for (const key of Object.keys(shape)) {
      output[key] = coerceToSchemaShape(shape[key], candidate?.[key]);
    }
    return output;
  }

  return candidate ?? shape;
};

export const analyzeResume = async (req, res) => {
  const client = getOpenAIClient();
  if (!req.file) return res.status(400).json({ message: "PDF file is required." });
  const { jobDescription = "" } = req.body;

  const fallbackResult = {
    score: 65,
    strengths: ["Clear structure"],
    weaknesses: ["Missing measurable impact"],
    missingKeywords: [],
    suggestions: ["Add quantified outcomes in work experience."],
    sectionAnalysis: {
      education: { rating: 7, feedback: "Education is present but can include achievements." },
      experience: { rating: 6, feedback: "Experience needs more quantified impact." },
      skills: { rating: 6, feedback: "Add role-specific technical keywords." },
      projects: { rating: 5, feedback: "Projects need stronger outcomes and ownership language." },
    },
    recommendation: "Improve quantified impact and align keywords with the JD.",
    jobMatch: 60,
  };

  let parsed;
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const parser = new PDFParse({ data: dataBuffer });
    parsed = await parser.getText();
    await parser.destroy();
    const prompt = `
You are a senior ATS resume evaluator.
Return STRICT JSON only with this shape:
{
  "score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "missing_keywords": string[],
  "suggestions": string[],
  "section_analysis": {
    "education": { "rating": number (0-10), "feedback": string },
    "experience": { "rating": number (0-10), "feedback": string },
    "skills": { "rating": number (0-10), "feedback": string },
    "projects": { "rating": number (0-10), "feedback": string }
  },
  "job_match": number (0-100),
  "recommendation": string
}
Requirements:
- Professional ATS-friendly analysis tone
- Concise bullets
- Use only data inferred from the resume and job description
Resume text: ${parsed.text}
Job description: ${jobDescription}
`;
    let result = fallbackResult;
    let aiWarning = null;
    try {
      const completion = await client.responses.create({
        model: process.env.AI_MODEL || "gemini-1.5-flash",
        input: prompt,
      });
      const raw = stripCodeFences(extractAIText(completion));
      const parsedResult = safeJSON(raw, fallbackResult);
      result = {
        score: parsedResult.score ?? fallbackResult.score,
        strengths: parsedResult.strengths ?? fallbackResult.strengths,
        weaknesses: parsedResult.weaknesses ?? fallbackResult.weaknesses,
        missingKeywords: parsedResult.missing_keywords ?? parsedResult.missingKeywords ?? fallbackResult.missingKeywords,
        suggestions: parsedResult.suggestions ?? fallbackResult.suggestions,
        sectionAnalysis: parsedResult.section_analysis ?? parsedResult.sectionAnalysis ?? fallbackResult.sectionAnalysis,
        jobMatch: parsedResult.job_match ?? parsedResult.jobMatch ?? fallbackResult.jobMatch,
        recommendation: parsedResult.recommendation ?? fallbackResult.recommendation,
      };
    } catch (aiError) {
      aiWarning = `AI provider failed, fallback analysis used: ${aiError.message}`;
    }

    const analysis = await Analysis.create({
      resumeId: req.body.resumeId || null,
      score: result.score,
      feedback: {
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        missingKeywords: result.missingKeywords,
      },
      suggestions: result.suggestions,
      jobMatch: result.jobMatch,
    });

    if (req.body.resumeId) {
      await Resume.findByIdAndUpdate(req.body.resumeId, { atsScore: result.score });
    }

    return res.status(201).json({
      ...analysis.toObject(),
      sectionAnalysis: result.sectionAnalysis,
      recommendation: result.recommendation,
      extractedText: parsed.text || "",
      warning: aiWarning,
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

export const improveResume = async (req, res) => {
  const client = getOpenAIClient();
  const { resumeText = "", resumeData = null, jobDescription, missingSkills = [] } = req.body;
  const structuredInput = resumeData ? JSON.stringify(resumeData) : resumeText;
  const prompt = `
You are an expert resume writer.
Rewrite and improve the resume while preserving the exact render structure.
STRICT RULES (MUST FOLLOW):
1) Keep the EXACT SAME structure, format, and layout as the original resume data.
2) Do NOT change section order.
3) Do NOT convert content into paragraphs.
4) Maintain bullet points as bullet points.
5) Do NOT remove or add sections.
6) ONLY improve wording of existing content fields.
7) Keep output concise, ATS-friendly, and professional.
8) Use strong action verbs and measurable outcomes where possible.
9) Preserve the same field names and array/object shape for structured output.

Return STRICT JSON only:
{
  "improvedText": "string",
  "improvements": ["string"],
  "improvedResume": {
    "title": "string",
    "template": "string",
    "personalInfo": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "github": "string",
      "summary": "string",
      "links": ["string"]
    },
    "education": [{ "school": "string", "degree": "string", "year": "string", "cgpa": "string", "startDate": "string", "endDate": "string", "description": "string" }],
    "experience": [{ "company": "string", "role": "string", "startDate": "string", "endDate": "string", "bullets": ["string"] }],
    "projects": [{ "name": "string", "description": "string", "technologies": ["string"], "github": "string", "live": "string", "link": "string" }],
    "skills": ["string"],
    "achievements": ["string"],
    "certifications": ["string"]
  }
}
Resume: ${structuredInput}
Job Description: ${jobDescription}
Missing Skills: ${missingSkills.join(", ")}
`;
  try {
    const completion = await client.responses.create({
      model: process.env.AI_MODEL || "gemini-1.5-flash",
      input: prompt,
    });
    const raw = stripCodeFences(extractAIText(completion));
    const payload = safeJSON(raw, {
      improvedText: raw,
      improvements: ["Improved clarity and keyword relevance."],
      improvedResume: null,
    });
    const strictImprovedResume = resumeData
      ? normalizeToSourceShape(resumeData, payload.improvedResume || {})
      : coerceToSchemaShape(resumeSchemaShape, payload.improvedResume || {});
    return res.json({
      improvedText: payload.improvedText || raw,
      improvements: payload.improvements || ["Improved clarity and keyword relevance."],
      improvedResume: strictImprovedResume,
    });
  } catch (error) {
    res.json({
      improvedText: resumeText,
      improvements: [
        "AI provider unavailable right now. Please verify AI_API_KEY and AI_MODEL.",
      ],
      improvedResume: resumeData || coerceToSchemaShape(resumeSchemaShape, {}),
      warning: error.message,
    });
  }
};
