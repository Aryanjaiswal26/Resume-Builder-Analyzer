import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import BuilderPage from "./pages/BuilderPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import ProfilePage from "./pages/ProfilePage";
import Home from "./pages/Home";
import DashboardLayout from "./layouts/DashboardLayout";
import { fetchResumes } from "./api/resumeApi";

export default function App() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;
    return true;
  });
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const onAuth = (data) => {
    auth.login(data);
    navigate("/dashboard");
  };

  const onLogout = () => {
    auth.logout();
    navigate("/");
  };

  useEffect(() => {
    if (!auth.token) return;
    fetchResumes().then((data) => setResumes(data)).catch(() => {});
  }, [auth.token]);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const shared = useMemo(
    () => ({ resumes, setResumes, analyses, setAnalyses }),
    [resumes, analyses]
  );

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage mode="login" onAuth={onAuth} />} />
      <Route path="/signup" element={<AuthPage mode="signup" onAuth={onAuth} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={auth.token}>
            <DashboardLayout user={auth.user} onLogout={onLogout} dark={dark} setDark={setDark}>
              <DashboardPage resumes={shared.resumes} analyses={shared.analyses} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder"
        element={
          <ProtectedRoute token={auth.token}>
            <DashboardLayout user={auth.user} onLogout={onLogout} dark={dark} setDark={setDark}>
              <BuilderPage setResumes={shared.setResumes} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyzer"
        element={
          <ProtectedRoute token={auth.token}>
            <DashboardLayout user={auth.user} onLogout={onLogout} dark={dark} setDark={setDark}>
              <AnalyzerPage resumes={shared.resumes} setAnalyses={shared.setAnalyses} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute token={auth.token}>
            <DashboardLayout user={auth.user} onLogout={onLogout} dark={dark} setDark={setDark}>
              <ProfilePage user={auth.user} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
