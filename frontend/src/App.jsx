import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 }                  from "lucide-react";

import { useAuth }         from "./context/AuthContext.jsx";
import DashboardLayout     from "./layouts/DashboardLayout.jsx";
import Login               from "./views/Login.jsx";
import Signup              from "./views/Signup.jsx";
import ProfileWizard       from "./views/ProfileWizard.jsx";
import JobBoard            from "./views/JobBoard.jsx";
import AiInsightsPanel     from "./components/AiInsightsPanel.jsx";

const Dashboard  = () => <PlaceholderPage title="Dashboard"    />;

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <Loader2 size={18} className="text-brand-400" />
      </div>
      <p className="text-sm">{title} — coming in Step 5</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 size={32} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  return isAuthed ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthed, isLoading } = useAuth();

  if (isLoading) return null; 

  return isAuthed ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ────────────────────────────────── */}
      <Route
        path="/login"
        element={<PublicRoute><Login /></PublicRoute>}
      />
      <Route
        path="/signup"
        element={<PublicRoute><Signup /></PublicRoute>}
      />

      {/* ── Protected routes (all inside DashboardLayout) ── */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile"   element={<ProfileWizard />}   />
        <Route path="/jobs"      element={<JobBoard />}       />
        <Route path="/jobs/:id"  element={<AiInsightsPanel />}  />
      </Route>

      {/* ── Fallbacks ──────────────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
