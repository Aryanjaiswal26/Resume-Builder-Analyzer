import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Card from "../components/Card";
import ActionButton from "../components/ActionButton";
import { analyzeResume, improveResume } from "../api/analyzeApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const stringifyResume = (resume) => {
  if (!resume) return "";
  const exp = (resume.experience || [])
    .map((e) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate}): ${(e.bullets || []).join(" | ")}`)
    .join("\n");
  const projects = (resume.projects || [])
    .map((p) => `${p.name}: ${p.description}. Tech: ${(p.technologies || []).join(", ")}`)
    .join("\n");
  return `
Name: ${resume.personalInfo?.fullName || ""}
Email: ${resume.personalInfo?.email || ""}
Summary: ${resume.personalInfo?.summary || ""}
Experience:
${exp}
Projects:
${projects}
Skills: ${(resume.skills || []).join(", ")}
`;
};

export default function AnalyzerPage({ resumes = [], setAnalyses }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const debouncedJD = useDebouncedValue(jobDescription, 400);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [improved, setImproved] = useState({ before: "", after: "", improvedResume: null });
  const improvedPaperRef = useRef(null);

  const scoreColor = useMemo(() => {
    const score = analysis?.score || 0;
    if (score < 50) return "#ef4444";
    if (score < 75) return "#f59e0b";
    return "#22c55e";
  }, [analysis]);

  const selectedResume = useMemo(
    () => resumes.find((r) => r._id === selectedResumeId) || null,
    [resumes, selectedResumeId]
  );

  const onAnalyze = async () => {
    if (!file) return toast.error("Please upload a PDF resume first.");
    try {
      setLoading(true);
      const data = await analyzeResume({ file, jobDescription: debouncedJD });
      setAnalysis(data);
      setAnalyses((p) => [data, ...p]);
      toast.success("ATS analysis complete");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const onImprove = async () => {
    const beforeText =
      selectedResume ? stringifyResume(selectedResume) : analysis?.extractedText || "";
    if (!beforeText) return toast.error("Upload and analyze a resume or select an existing resume first.");
    try {
      setImproving(true);
      const data = await improveResume({
        resumeText: beforeText,
        resumeData: selectedResume,
        jobDescription: debouncedJD,
        missingSkills: analysis?.feedback?.missingKeywords || [],
      });
      setImproved({ before: beforeText, after: data.improvedText || "", improvedResume: data.improvedResume || null });
      toast.success("Resume improved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Resume improvement failed.");
    } finally {
      setImproving(false);
    }
  };

  const downloadImprovedPdf = async () => {
    if (!improved.improvedResume || !improvedPaperRef.current) {
      return toast.error("No structured improved resume available yet.");
    }
    try {
      setDownloadLoading(true);
      const img = await toPng(improvedPaperRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const ratio =
        improvedPaperRef.current.scrollHeight / improvedPaperRef.current.scrollWidth;
      const imgHeight = contentWidth * ratio;
      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(img, "PNG", margin, margin, contentWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let offset = 0;
        while (remainingHeight > 0) {
          if (offset > 0) pdf.addPage();
          pdf.addImage(img, "PNG", margin, margin - offset, contentWidth, imgHeight);
          remainingHeight -= pageHeight - margin * 2;
          offset += pageHeight - margin * 2;
        }
      }
      pdf.save("improved-resume.pdf");
      toast.success("Resume Downloaded");
    } finally {
      setDownloadLoading(false);
    }
  };

  const sectionCards = analysis?.sectionAnalysis || {};

  return (
    <div className="space-y-4 w-full">
      <Card className="w-full">
        <h2 className="font-semibold mb-2 text-xl">ATS Resume Analyzer</h2>
        <div
          className={`border-2 border-dashed rounded-xl p-8 transition ${dragActive ? "border-cyan-300 bg-cyan-400/10" : "border-white/20"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) setFile(dropped);
          }}
        >
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0])} />
          {file && <p className="mt-2 text-sm text-cyan-300">Selected: {file.name}</p>}
        </div>
        <textarea className="input min-h-24 mt-2" placeholder="Paste job description" onChange={(e) => setJobDescription(e.target.value)} />
        <ActionButton className="mt-2" loading={loading} onClick={onAnalyze}>Analyze Resume</ActionButton>
      </Card>
      {loading && (
        <Card>
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 bg-white/15 rounded" />
            <div className="h-24 w-full bg-white/10 rounded-xl" />
            <div className="h-24 w-full bg-white/10 rounded-xl" />
          </div>
        </Card>
      )}
      {analysis && (
        <div className="space-y-4">
          <Card>
            <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center">
              <div className="grid place-items-center">
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90">
                    <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
                    <motion.circle cx="50" cy="50" r="44" stroke={scoreColor} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={276} initial={{ strokeDashoffset: 276 }} animate={{ strokeDashoffset: 276 - (276 * (analysis.score || 0)) / 100 }} />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-2xl font-bold">{analysis.score}</div>
                </div>
                <p className="text-sm opacity-80 mt-2">ATS Score</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3"><p className="font-medium">Strengths ✅</p><ul className="text-sm mt-1 list-disc ml-4">{(analysis.feedback?.strengths || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div className="glass rounded-xl p-3"><p className="font-medium">Weaknesses ❌</p><ul className="text-sm mt-1 list-disc ml-4">{(analysis.feedback?.weaknesses || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div className="glass rounded-xl p-3"><p className="font-medium">Missing Keywords ⚠️</p><ul className="text-sm mt-1 list-disc ml-4">{(analysis.feedback?.missingKeywords || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div className="glass rounded-xl p-3"><p className="font-medium">Suggestions 💡</p><ul className="text-sm mt-1 list-disc ml-4">{(analysis.suggestions || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold">Job Matching</h3>
            <p className="mt-2">Match Percentage: <span className="text-cyan-300">{analysis.jobMatch}%</span></p>
            <p className="text-sm mt-1">Missing Skills: {(analysis.feedback?.missingKeywords || []).join(", ") || "None"}</p>
            <p className="text-sm mt-1">Recommendation: {analysis.recommendation || "Tailor resume bullets to match the target role."}</p>
          </Card>

          <Card>
            <h3 className="font-semibold mb-2">Section-wise Analysis</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {["education", "experience", "skills", "projects"].map((sec) => (
                <div key={sec} className="glass rounded-xl p-3">
                  <p className="capitalize font-medium">{sec}</p>
                  <p className="text-sm mt-1">Rating: {sectionCards?.[sec]?.rating ?? 6}/10</p>
                  <p className="text-xs opacity-80 mt-1">{sectionCards?.[sec]?.feedback || "Needs stronger alignment with the job requirements."}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold">Auto Improve</h3>
            <select className="input mt-3" value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}>
              <option value="">Use uploaded/analyzed resume</option>
              {resumes.map((r) => <option key={r._id} value={r._id}>{r.title || "Untitled Resume"}</option>)}
            </select>
            <div className="mt-2 flex gap-2">
              <ActionButton loading={improving} onClick={onImprove}>Improve Resume</ActionButton>
              <ActionButton variant="secondary" loading={downloadLoading} onClick={downloadImprovedPdf}>Download Resume</ActionButton>
            </div>
            {improved.improvedResume && (
              <div className="mt-4 rounded-xl border border-white/15 p-3 bg-white/5">
                <p className="text-sm mb-2 opacity-80">Improved Resume Preview (same structure)</p>
                <div className="max-h-[70vh] overflow-auto grid place-items-center">
                  <div
                    ref={improvedPaperRef}
                    className={`w-full max-w-[820px] aspect-[210/297] overflow-auto bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl p-8 resume-template template-${improved.improvedResume.template || "modern-minimal"}`}
                  >
                    <h2 className="text-3xl font-bold">{improved.improvedResume.personalInfo?.fullName || "Your Name"}</h2>
                    <p className="text-slate-600">{improved.improvedResume.personalInfo?.email} {improved.improvedResume.personalInfo?.phone ? `| ${improved.improvedResume.personalInfo?.phone}` : ""}</p>
                    <p className="text-slate-600 text-sm">{improved.improvedResume.personalInfo?.linkedin} {improved.improvedResume.personalInfo?.github ? `| ${improved.improvedResume.personalInfo?.github}` : ""}</p>

                    <div className="mt-5">
                      <h3 className="font-semibold border-b pb-1">Summary</h3>
                      <p className="mt-2">{improved.improvedResume.personalInfo?.summary}</p>
                    </div>
                    <div className="mt-5">
                      <h3 className="font-semibold border-b pb-1">Experience</h3>
                      {(improved.improvedResume.experience || []).map((ex, idx) => (
                        <div key={idx} className="mt-2">
                          <p className="font-medium">{ex.role} - {ex.company}</p>
                          <p className="text-xs text-slate-500">{ex.startDate} {ex.endDate}</p>
                          <ul className="list-disc ml-5">{(ex.bullets || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <h3 className="font-semibold border-b pb-1">Education</h3>
                      {(improved.improvedResume.education || []).map((ed, idx) => <p key={idx} className="text-sm mt-1">{ed.degree} - {ed.school} ({ed.year}) {ed.cgpa ? `| CGPA ${ed.cgpa}` : ""}</p>)}
                    </div>
                    <div className="mt-5">
                      <h3 className="font-semibold border-b pb-1">Skills</h3>
                      <p className="text-sm">{(improved.improvedResume.skills || []).join(", ")}</p>
                    </div>
                    <div className="mt-5">
                      <h3 className="font-semibold border-b pb-1">Projects</h3>
                      {(improved.improvedResume.projects || []).map((p, idx) => <p key={idx} className="text-sm mt-1">{p.name}: {p.description}</p>)}
                    </div>
                    {(improved.improvedResume.achievements || []).length > 0 && <div className="mt-5"><h3 className="font-semibold border-b pb-1">Achievements</h3><ul className="list-disc ml-5">{improved.improvedResume.achievements.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
                    {(improved.improvedResume.certifications || []).length > 0 && <div className="mt-5"><h3 className="font-semibold border-b pb-1">Certifications</h3><ul className="list-disc ml-5">{improved.improvedResume.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
                  </div>
                </div>
              </div>
            )}
            {(improved.before || improved.after) && (
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="glass rounded-xl p-3"><p className="font-medium mb-2">Before</p><pre className="text-xs whitespace-pre-wrap max-h-60 overflow-auto">{improved.before}</pre></div>
                <div className="glass rounded-xl p-3"><p className="font-medium mb-2">After</p><pre className="text-xs whitespace-pre-wrap max-h-60 overflow-auto">{improved.after}</pre></div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
