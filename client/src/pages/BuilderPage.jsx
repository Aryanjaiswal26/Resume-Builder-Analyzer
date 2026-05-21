import { useRef, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import Card from "../components/Card";
import ActionButton from "../components/ActionButton";
import { createResume, generateResumeBullets } from "../api/resumeApi";
import { cn } from "../utils/cn";
import { baseResume } from "../utils/resumeDefaults";

export default function BuilderPage({ setResumes }) {
  const [resume, setResume] = useState(baseResume);
  const previewRef = useRef(null);
  const resumePaperRef = useRef(null);
  const templates = [
    { id: "modern-minimal", name: "Modern Minimal", note: "Clean modern layout" },
    { id: "corporate-professional", name: "Corporate Professional", note: "Executive and formal" },
    { id: "creative-designer", name: "Creative Designer", note: "Color-accent visual style" },
    { id: "ats-friendly-clean", name: "ATS-Friendly Clean", note: "Keyword-scannable format" },
    { id: "bold-executive", name: "Bold Executive", note: "Strong leadership emphasis" },
    { id: "tech-developer", name: "Tech Developer", note: "Built for engineering roles" },
    { id: "elegant-classic", name: "Elegant Classic", note: "Timeless professional tone" },
  ];
  const [sectionOrder, setSectionOrder] = useState(["summary", "experience", "education", "skills", "projects"]);
  const [highlightMode, setHighlightMode] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [highlightSection, setHighlightSection] = useState("summary");

  const addItem = (key, item) => setResume((p) => ({ ...p, [key]: [...(p[key] || []), item] }));
  const removeItem = (key, index) =>
    setResume((p) => ({ ...p, [key]: (p[key] || []).filter((_, i) => i !== index) }));

  const updateArrayField = (key, index, field, value) =>
    setResume((p) => ({
      ...p,
      [key]: p[key].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));

  const save = async () => {
    try {
      setSaveLoading(true);
      const data = await createResume(resume);
      setResumes((p) => [data, ...p]);
      toast.success("Resume saved");
    } finally {
      setSaveLoading(false);
    }
  };

  const generateBullets = async () => {
    const exp = resume.experience[0];
    const data = await generateResumeBullets({ role: exp.role, company: exp.company, jobDescription: exp.role });
    setResume({ ...resume, experience: [{ ...exp, bullets: JSON.parse(data.bullets || "[]") }] });
  };

  const enhanceContent = async () => {
    try {
      setEnhanceLoading(true);
      setHighlightSection("experience");
      await generateBullets();
      setResume((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          summary:
            prev.personalInfo.summary ||
            "Results-driven professional with strong execution skills, ownership mindset, and measurable impact across cross-functional projects.",
        },
      }));
      toast.success("Content Enhanced");
    } finally {
      setEnhanceLoading(false);
    }
  };

  const moveSection = (index, dir) => {
    const next = [...sectionOrder];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setSectionOrder(next);
  };

  const activeTemplate = templates.find((t) => t.id === resume.template) || templates[0];
  const templateClass = `resume-template template-${activeTemplate.id}`;

  const downloadPdf = async () => {
    if (!resumePaperRef.current) return;
    try {
      setDownloadLoading(true);
      const img = await toPng(resumePaperRef.current, {
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
        resumePaperRef.current.scrollHeight / resumePaperRef.current.scrollWidth;
      const imgHeight = contentWidth * ratio;

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(img, "PNG", margin, margin, contentWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let y = margin;
        let position = 0;
        while (remainingHeight > 0) {
          if (position > 0) pdf.addPage();
          pdf.addImage(img, "PNG", margin, y - position, contentWidth, imgHeight);
          remainingHeight -= pageHeight - margin * 2;
          position += pageHeight - margin * 2;
        }
      }
      pdf.save(`${resume.personalInfo.fullName || "resume"}.pdf`);
      toast.success("Resume Downloaded");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="grid xl:grid-cols-[1fr_1.2fr] gap-4 min-h-[80vh]">
      <Card className="h-full">
        <h2 className="font-semibold mb-3">Resume Builder</h2>
        <div className="space-y-4 max-h-[78vh] overflow-auto pr-1">
          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Personal Info</h3>
            <label className="field-label">Full Name</label>
            <input className="input" placeholder="e.g., Aryan Sharma" onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, fullName: e.target.value } })} />
            <label className="field-label">Email</label>
            <input className="input" placeholder="e.g., aryan@email.com" onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, email: e.target.value } })} />
            <label className="field-label">Phone</label>
            <input className="input" placeholder="e.g., +91-9876543210" onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, phone: e.target.value } })} />
            <label className="field-label">LinkedIn</label>
            <input className="input" placeholder="https://linkedin.com/in/..." onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, linkedin: e.target.value } })} />
            <label className="field-label">GitHub</label>
            <input className="input" placeholder="https://github.com/..." onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, github: e.target.value } })} />
            <label className="field-label">Professional Summary</label>
            <textarea className="input min-h-24" placeholder="Write a concise ATS-friendly profile summary" onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, summary: e.target.value } })} />
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Education</h3>
            {resume.education.map((ed, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-2 border border-white/10 rounded-lg p-2">
                <input className="input" placeholder="Degree" value={ed.degree} onChange={(e) => updateArrayField("education", i, "degree", e.target.value)} />
                <input className="input" placeholder="College" value={ed.school} onChange={(e) => updateArrayField("education", i, "school", e.target.value)} />
                <input className="input" placeholder="Year" value={ed.year || ""} onChange={(e) => updateArrayField("education", i, "year", e.target.value)} />
                <input className="input" placeholder="CGPA" value={ed.cgpa || ""} onChange={(e) => updateArrayField("education", i, "cgpa", e.target.value)} />
                <ActionButton variant="secondary" className="md:col-span-2" onClick={() => removeItem("education", i)}>Remove</ActionButton>
              </motion.div>
            ))}
            <ActionButton variant="secondary" onClick={() => addItem("education", { school: "", degree: "", year: "", cgpa: "", startDate: "", endDate: "", description: "" })}>Add More Education</ActionButton>
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Experience</h3>
            {resume.experience.map((ex, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 border border-white/10 rounded-lg p-2">
                <input className="input" placeholder="Company" value={ex.company} onChange={(e) => updateArrayField("experience", i, "company", e.target.value)} />
                <input className="input" placeholder="Role" value={ex.role} onChange={(e) => updateArrayField("experience", i, "role", e.target.value)} />
                <input className="input" placeholder="Duration" value={`${ex.startDate || ""} ${ex.endDate || ""}`.trim()} onChange={(e) => {
                  const [startDate = "", endDate = ""] = e.target.value.split(" - ");
                  setResume((p) => ({ ...p, experience: p.experience.map((item, idx) => (idx === i ? { ...item, startDate, endDate } : item)) }));
                }} />
                <textarea className="input min-h-24" placeholder="Bullet points (one per line)" value={(ex.bullets || []).join("\n")} onChange={(e) => updateArrayField("experience", i, "bullets", e.target.value.split("\n").filter(Boolean))} />
                <ActionButton variant="secondary" onClick={() => removeItem("experience", i)}>Remove</ActionButton>
              </motion.div>
            ))}
            <ActionButton variant="secondary" onClick={() => addItem("experience", { company: "", role: "", startDate: "", endDate: "", bullets: [""] })}>Add More Experience</ActionButton>
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Projects</h3>
            {resume.projects.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-2 border border-white/10 rounded-lg p-2">
                <input className="input" placeholder="Project Name" value={p.name} onChange={(e) => updateArrayField("projects", i, "name", e.target.value)} />
                <input className="input" placeholder="Tech Stack (comma separated)" value={(p.technologies || []).join(", ")} onChange={(e) => updateArrayField("projects", i, "technologies", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
                <textarea className="input md:col-span-2 min-h-20" placeholder="Description" value={p.description} onChange={(e) => updateArrayField("projects", i, "description", e.target.value)} />
                <input className="input" placeholder="GitHub Link" value={p.github || ""} onChange={(e) => updateArrayField("projects", i, "github", e.target.value)} />
                <input className="input" placeholder="Live Link" value={p.live || ""} onChange={(e) => updateArrayField("projects", i, "live", e.target.value)} />
                <ActionButton variant="secondary" className="md:col-span-2" onClick={() => removeItem("projects", i)}>Remove</ActionButton>
              </motion.div>
            ))}
            <ActionButton variant="secondary" onClick={() => addItem("projects", { name: "", description: "", technologies: [], github: "", live: "", link: "" })}>Add More Projects</ActionButton>
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Skills</h3>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Type skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!skillInput.trim()) return;
                    setResume((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
                    setSkillInput("");
                  }
                  if (e.key === "Backspace" && !skillInput.trim() && resume.skills.length) {
                    setResume((p) => ({ ...p, skills: p.skills.slice(0, -1) }));
                  }
                }}
              />
              <ActionButton variant="secondary" onClick={() => {
                if (!skillInput.trim()) return;
                setResume((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
                setSkillInput("");
              }}>+</ActionButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((s, i) => <button key={`${s}-${i}`} className="pill" onClick={() => setResume((p) => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}>{s} ×</button>)}
            </div>
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Achievements (optional)</h3>
            <div className="flex gap-2">
              <input className="input" value={achievementInput} onChange={(e) => setAchievementInput(e.target.value)} />
              <ActionButton variant="secondary" onClick={() => {
                if (!achievementInput.trim()) return;
                setResume((p) => ({ ...p, achievements: [...(p.achievements || []), achievementInput.trim()] }));
                setAchievementInput("");
              }}>+</ActionButton>
            </div>
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            <h3 className="font-medium">Certifications (optional)</h3>
            <div className="flex gap-2">
              <input className="input" value={certInput} onChange={(e) => setCertInput(e.target.value)} />
              <ActionButton variant="secondary" onClick={() => {
                if (!certInput.trim()) return;
                setResume((p) => ({ ...p, certifications: [...(p.certifications || []), certInput.trim()] }));
                setCertInput("");
              }}>+</ActionButton>
            </div>
          </div>

          <div className="glass rounded-xl p-3">
            <p className="text-sm font-medium mb-2">Choose Template</p>
            <div className="grid md:grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setResume({ ...resume, template: t.id })}
                  className={cn(
                    "text-left rounded-xl border px-3 py-2 transition",
                    resume.template === t.id
                      ? "border-cyan-300 bg-cyan-500/20 ring-2 ring-cyan-300/50"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs opacity-80">{t.note}</p>
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm inline-flex items-center gap-2">
            <input type="checkbox" checked={highlightMode} onChange={() => setHighlightMode((v) => !v)} />
            Highlight important sections
          </label>
          <div className="glass rounded-xl p-3">
            <p className="text-sm font-medium mb-2">Section order</p>
            {sectionOrder.map((section, idx) => (
              <div key={section} className="flex items-center justify-between py-1 text-sm">
                <span className="capitalize">{section}</span>
                <div className="flex gap-2">
                  <ActionButton variant="secondary" className="px-2 py-1" onClick={() => moveSection(idx, -1)}>↑</ActionButton>
                  <ActionButton variant="secondary" className="px-2 py-1" onClick={() => moveSection(idx, 1)}>↓</ActionButton>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton loading={saveLoading} onClick={save}>Save Resume</ActionButton>
            <ActionButton variant="secondary" onClick={generateBullets}>AI Bullet Points</ActionButton>
            <ActionButton variant="secondary" loading={enhanceLoading} title="Improve with AI" onClick={enhanceContent}>Enhance Content</ActionButton>
            <ActionButton variant="secondary" loading={downloadLoading} onClick={downloadPdf}>Download Resume</ActionButton>
          </div>
        </div>
      </Card>
      <motion.div ref={previewRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
        <Card className="min-h-[80vh] p-3">
          <div className="h-full w-full overflow-auto grid place-items-start md:place-items-center">
          <div
            ref={resumePaperRef}
            className={cn(
              "w-full max-w-[820px] aspect-[210/297] overflow-auto bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl p-8",
              templateClass
            )}
          >
          <h2 className="text-3xl font-bold">{resume.personalInfo.fullName || "Your Name"}</h2>
          <p className="text-slate-600">{resume.personalInfo.email} {resume.personalInfo.phone ? `| ${resume.personalInfo.phone}` : ""}</p>
          <p className="text-slate-600 text-sm">{resume.personalInfo.linkedin} {resume.personalInfo.github ? `| ${resume.personalInfo.github}` : ""}</p>
          {sectionOrder.map((section) => (
            <motion.div
              key={section}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className={cn(
                "mt-5 transition-all",
                highlightMode && (section === "experience" || section === "skills") && "rounded-lg border border-cyan-200 p-3 bg-cyan-50",
                highlightSection === section && "ring-2 ring-violet-400"
              )}
            >
              {section === "summary" && (
                <>
                  <h3 className="font-semibold border-b pb-1">Summary</h3>
                  <p className="mt-2">{resume.personalInfo.summary || "Your AI-polished summary appears here..."}</p>
                </>
              )}
              {section === "experience" && (
                <>
                  <h3 className="font-semibold border-b pb-1">Experience</h3>
                  {(resume.experience || []).map((ex, idx) => (
                    <div key={idx} className="mt-2">
                      <p className="font-medium">{ex.role} - {ex.company}</p>
                      <p className="text-xs text-slate-500">{ex.startDate} {ex.endDate}</p>
                      <ul className="list-disc ml-5">{(ex.bullets || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                  ))}
                </>
              )}
              {section === "education" && (
                <>
                  <h3 className="font-semibold border-b pb-1">Education</h3>
                  {(resume.education || []).map((ed, idx) => <p key={idx} className="text-sm mt-1">{ed.degree} - {ed.school} ({ed.year}) {ed.cgpa ? `| CGPA ${ed.cgpa}` : ""}</p>)}
                </>
              )}
              {section === "skills" && (
                <>
                  <h3 className="font-semibold border-b pb-1">Skills</h3>
                  <p className="text-sm">{resume.skills.join(", ") || "JavaScript, React, Node.js, MongoDB"}</p>
                </>
              )}
              {section === "projects" && (
                <>
                  <h3 className="font-semibold border-b pb-1">Projects</h3>
                  {(resume.projects || []).map((p, idx) => <p key={idx} className="text-sm mt-1">{p.name}: {p.description}</p>)}
                </>
              )}
            </motion.div>
          ))}
          {(resume.achievements || []).length > 0 && <div className="mt-5"><h3 className="font-semibold border-b pb-1">Achievements</h3><ul className="list-disc ml-5">{resume.achievements.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
          {(resume.certifications || []).length > 0 && <div className="mt-5"><h3 className="font-semibold border-b pb-1">Certifications</h3><ul className="list-disc ml-5">{resume.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
          </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
