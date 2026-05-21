import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "../utils/cn";

export default function DashboardLayout({ children, user, onLogout, dark, setDark }) {
  const [open, setOpen] = useState(false);
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className={cn("min-h-screen gradient-bg", dark ? "theme-dark text-slate-100" : "theme-light text-slate-900")}>
      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-8 grid md:grid-cols-[260px_1fr] gap-4">
        <div className="glass rounded-2xl p-4 md:p-6 h-fit">
          <div className="font-semibold text-lg">AI Resume Builder Pro</div>
          <div className="text-sm opacity-70">{user?.email}</div>
          <nav className="mt-4 flex md:flex-col gap-2 text-sm">
            <Link className="pill" to="/dashboard">Dashboard</Link>
            <Link className="pill" to="/builder">Builder</Link>
            <Link className="pill" to="/analyzer">Analyzer</Link>
            <Link className="pill" to="/profile">Profile</Link>
          </nav>
          <div className="mt-4 flex gap-2">
            <button className="btn-secondary" onClick={() => setDark(!dark)}>{dark ? "Light" : "Dark"}</button>
            <button className="btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <div>
          <div className="mb-4 flex justify-end">
            <div className="relative z-40">
              <button className="btn-secondary inline-flex items-center gap-2" onClick={() => setOpen((v) => !v)}>
                <span className="h-8 w-8 rounded-full bg-violet-500/50 border border-violet-200/40 grid place-items-center text-sm font-semibold">{initials}</span>
                <span className="hidden sm:block text-left">
                  <span className="block text-sm">{user?.name || "User"}</span>
                  <span className="block text-xs opacity-70">{user?.email}</span>
                </span>
                <FiChevronDown />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={cn(
                      "absolute right-0 mt-2 w-56 rounded-xl p-2 z-50 shadow-2xl border",
                      dark ? "bg-slate-900/95 border-white/20" : "bg-white border-slate-300"
                    )}
                  >
                    <Link to="/profile" onClick={() => setOpen(false)} className={cn("block px-3 py-2 rounded-lg text-sm", dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900")}>Profile</Link>
                    <button onClick={onLogout} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm", dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900")}>Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
