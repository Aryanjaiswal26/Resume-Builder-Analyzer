import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCpu,
  FiFileText,
  FiGithub,
  FiLinkedin,
  FiSearch,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiTwitter,
  FiZap,
} from "react-icons/fi";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SectionTitle({ title, subtitle }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-slate-300">{subtitle}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="gradient-bg min-h-screen text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(6,182,212,0.20),transparent_35%)]" />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/35 border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-wide">AI Resume Pro</Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-200">
            <a href="#home" className="hover:text-cyan-300 transition">Home</a>
            <a href="#features" className="hover:text-cyan-300 transition">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-300 transition">How It Works</a>
            <a href="#pricing" className="hover:text-cyan-300 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm">Login</Link>
            <Link to="/signup" className="btn text-sm">Sign Up</Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section id="home" className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300 bg-cyan-400/10 border border-cyan-300/30 rounded-full px-3 py-1">
                <FiZap /> AI-Powered Career Toolkit
              </p>
              <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight">
                Build, Analyze & Improve Your Resume with AI
              </h1>
              <p className="mt-5 text-slate-300 text-lg max-w-xl">
                Create ATS-friendly resumes, get instant feedback, and land your dream job faster.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="btn inline-flex items-center gap-2">
                  Get Started <FiArrowRight />
                </Link>
                <Link to="/analyzer" className="btn-secondary inline-flex items-center gap-2">
                  Analyze Resume <FiSearch />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-slate-300">Resume Preview</p>
                  <h3 className="font-semibold">Priya Sharma - Product Engineer</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 border border-violet-300/30">ATS Ready</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="h-3 w-2/3 rounded bg-white/20" />
                <div className="h-3 w-4/5 rounded bg-white/10" />
                <div className="h-3 w-3/5 rounded bg-white/10" />
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-2 text-slate-300">
                  <span>ATS Score</span>
                  <span>86/100</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "86%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <SectionTitle title="Everything you need to get hired faster" subtitle="A complete AI workflow for resume creation, ATS optimization, and instant improvement." />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              { icon: FiFileText, title: "AI Resume Builder", desc: "Generate professional resumes in seconds" },
              { icon: FiTrendingUp, title: "ATS Resume Analyzer", desc: "Get score, feedback, and job match insights" },
              { icon: FiCpu, title: "Smart Improvement", desc: "Auto-enhance your resume using AI" },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6 }}
                className="glass rounded-2xl p-6 border border-white/15 shadow-xl"
              >
                <item.icon className="text-cyan-300 text-2xl" />
                <h3 className="mt-4 font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-slate-300 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <SectionTitle title="How it works" subtitle="From profile details to final application in four simple steps." />
          <div className="mt-12 grid md:grid-cols-4 gap-4">
            {["Enter your details", "Generate resume", "Analyze & improve", "Download & apply"].map((step, idx) => (
              <motion.div key={step} whileHover={{ scale: 1.02 }} className="relative glass rounded-2xl p-5">
                <div className="h-9 w-9 rounded-full bg-violet-500/25 border border-violet-300/40 grid place-items-center text-sm font-bold">{idx + 1}</div>
                <p className="mt-4 text-sm text-slate-200">{step}</p>
                {idx < 3 && <div className="hidden md:block absolute -right-3 top-9 h-[2px] w-6 bg-white/25" />}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <SectionTitle title="Why choose AI Resume Pro" subtitle="Built for modern job seekers who need quality, speed, and confidence." />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              "ATS Optimization",
              "AI-powered suggestions",
              "Multiple templates",
              "Fast & secure",
            ].map((point) => (
              <div key={point} className="glass rounded-xl p-4 flex items-center gap-2">
                <FiCheckCircle className="text-cyan-300" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <SectionTitle title="Live product preview" subtitle="Understand exactly how your resume performs before you apply." />
          <div className="mt-10 grid lg:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold">Sample Resume</h3>
              <div className="mt-4 space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-white/20" />
                <div className="h-2.5 w-4/5 rounded bg-white/10" />
                <div className="h-2.5 w-2/3 rounded bg-white/10" />
                <div className="h-2.5 w-5/6 rounded bg-white/10" />
                <div className="h-2.5 w-2/5 rounded bg-white/10" />
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold">ATS Performance</h3>
              <p className="text-sm text-slate-300 mt-2">Keyword match, readability and experience quality analysis.</p>
              <div className="mt-6 h-4 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "91%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1 }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
                />
              </div>
              <p className="text-sm mt-3 text-cyan-300">Overall ATS Score: 91%</p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <SectionTitle title="Loved by job seekers" subtitle="What early users say about AI Resume Pro." />
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { name: "Aman Verma", text: "I improved my ATS score from 58 to 87 in one evening.", stars: 5 },
              { name: "Ritika S.", text: "The AI suggestions made my resume far more recruiter-friendly.", stars: 5 },
              { name: "Nikhil Jain", text: "Super clean UI and genuinely useful analysis insights.", stars: 4 },
            ].map((t) => (
              <div key={t.name} className="glass rounded-2xl p-5">
                <div className="flex gap-1 text-amber-300">
                  {Array.from({ length: t.stars }).map((_, i) => <FiStar key={i} />)}
                </div>
                <p className="mt-3 text-sm text-slate-200">"{t.text}"</p>
                <p className="mt-4 text-sm text-slate-300">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold">Ready to land your dream job?</h3>
            <p className="mt-3 text-slate-300">Join thousands of professionals building smarter resumes with AI.</p>
            <Link to="/signup" className="mt-6 inline-flex items-center gap-2 btn">
              Get Started <FiArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid md:grid-cols-3 gap-6 items-center">
          <div>
            <p className="font-bold">AI Resume Pro</p>
            <p className="text-sm text-slate-400 mt-2">AI-powered resume creation, analysis, and optimization platform.</p>
          </div>
          <div className="flex gap-4 text-sm text-slate-300">
            <a href="#" className="hover:text-cyan-300">About</a>
            <a href="#" className="hover:text-cyan-300">Contact</a>
            <a href="#" className="hover:text-cyan-300">Privacy Policy</a>
          </div>
          <div className="flex gap-3 md:justify-end text-slate-300">
            <a href="#" className="hover:text-cyan-300"><FiTwitter /></a>
            <a href="#" className="hover:text-cyan-300"><FiLinkedin /></a>
            <a href="#" className="hover:text-cyan-300"><FiGithub /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
