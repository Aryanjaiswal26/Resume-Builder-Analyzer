import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import api from "../api/client";

export default function AuthPage({ mode, onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const rules = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "At least 1 uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "At least 1 lowercase letter", test: (v) => /[a-z]/.test(v) },
    { label: "At least 1 number", test: (v) => /\d/.test(v) },
    { label: "At least 1 special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];
  const passwordChecks = rules.map((r) => ({ ...r, ok: r.test(form.password || "") }));
  const isPasswordStrong = passwordChecks.every((r) => r.ok);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (mode === "signup" && !isPasswordStrong) {
      setErrorMsg("Please satisfy all password requirements.");
      return;
    }
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const { data } = await api.post(endpoint, form);
      if (mode === "signup") {
        setSuccessMsg("Registration successful ✔️");
        toast.success("Registration successful");
        setTimeout(() => navigate("/login"), 2200);
      } else {
        onAuth(data);
        toast.success("Welcome back");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Authentication failed.";
      setErrorMsg(message);
      if (message === "User not registered") {
        setErrorMsg("User not registered");
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 gradient-bg">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">{mode === "signup" ? "Create account" : "Sign in"}</h1>
        <form onSubmit={submit} className="space-y-3 mt-4">
          {mode === "signup" && (
            <input className="input" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <input className="input" placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input
            className="input"
            placeholder="Password"
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {mode === "signup" && (
            <div className="rounded-xl border border-white/15 bg-white/5 p-3 space-y-1 transition-all duration-200">
              {passwordChecks.map((rule) => (
                <div key={rule.label} className={`text-xs ${rule.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {rule.ok ? "✔️" : "❌"} {rule.label}
                </div>
              ))}
            </div>
          )}
          {errorMsg && (
            <p className="text-sm text-red-400 transition-all duration-200">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-sm text-emerald-400 transition-all duration-200">{successMsg}</p>
          )}
          <button className="btn w-full">{mode === "signup" ? "Sign Up" : "Login"}</button>
        </form>
        <p className="mt-3 text-sm">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="text-violet-400" to={mode === "signup" ? "/login" : "/signup"}>
            {mode === "signup" ? "Login" : "Sign up"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
