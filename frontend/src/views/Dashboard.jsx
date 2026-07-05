import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Trophy,
  Activity,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../lib/axios.js";
import AddJobModal from "../components/AddJobModal.jsx";

const STATUS_CONFIGS = {
  WISHLIST:     { label: "Wishlist",     color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-700/60" },
  APPLIED:      { label: "Applied",      color: "text-brand-400",   bg: "bg-brand-500/10",   border: "border-brand-500/20" },
  INTERVIEWING: { label: "Interviewing", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  OFFERED:      { label: "Offered",      color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20" },
  REJECTED:     { label: "Rejected",     color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
};

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const { data } = await api.get("/jobs");
      setJobs(data.data.applications ?? []);
    } catch (err) {
      console.error("[Dashboard Fetch]", err);
      setError("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Calculate metrics
  const totalJobs = jobs.length;
  const interviewingCount = jobs.filter((j) => j.status === "INTERVIEWING").length;
  const offersCount = jobs.filter((j) => j.status === "OFFERED").length;

  const analyzedJobs = jobs.filter((j) => j.aiAnalysis?.matchScore != null);
  const avgMatchScore = analyzedJobs.length > 0
    ? Math.round(analyzedJobs.reduce((acc, curr) => acc + curr.aiAnalysis.matchScore, 0) / analyzedJobs.length)
    : 0;

  // Status breakdown
  const statusCounts = { WISHLIST: 0, APPLIED: 0, INTERVIEWING: 0, OFFERED: 0, REJECTED: 0 };
  jobs.forEach((j) => {
    if (statusCounts[j.status] !== undefined) {
      statusCounts[j.status]++;
    }
  });

  const recentJobs = jobs.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-400 gap-2">
        <AlertCircle size={28} />
        <p className="text-sm">{error}</p>
        <button onClick={fetchJobs} className="btn-ghost text-xs px-4 py-2 mt-2">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Welcome Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Overview Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            Analyze metrics and optimize your search.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 text-xs px-4 py-2.5"
        >
          <Plus size={14} /> Add Application
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="card p-5 flex items-center gap-4 hover:border-slate-600/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/10">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Applications</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{totalJobs}</p>
          </div>
        </div>

        {/* Card 2: Avg ATS Match */}
        <div className="card p-5 flex items-center gap-4 hover:border-slate-600/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Match Score</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">
              {avgMatchScore > 0 ? `${avgMatchScore}%` : "—"}
            </p>
          </div>
        </div>

        {/* Card 3: Interviewing */}
        <div className="card p-5 flex items-center gap-4 hover:border-slate-600/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/10">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Interviewing</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{interviewingCount}</p>
          </div>
        </div>

        {/* Card 4: Offers */}
        <div className="card p-5 flex items-center gap-4 hover:border-slate-600/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/10">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Offers Received</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{offersCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Statuses and Recent list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Status Breakdown */}
        <div className="card p-6 lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-400" /> Pipeline Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Stages of your applications</p>
          </div>

          <div className="space-y-4">
            {Object.entries(STATUS_CONFIGS).map(([status, config]) => {
              const count = statusCounts[status];
              const percentage = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${config.color}`}>{config.label}</span>
                    <span className="text-slate-400 font-mono">
                      {count} <span className="text-slate-600">({percentage}%)</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${status === "WISHLIST" ? "bg-slate-700" : status === "APPLIED" ? "bg-brand-600" : status === "INTERVIEWING" ? "bg-amber-500" : status === "OFFERED" ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Applications */}
        <div className="card p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Recent Applications</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to your updates</p>
            </div>
            <Link
              to="/jobs"
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 group"
            >
              View all Board
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No job applications added yet. Start by adding one!
              </div>
            ) : (
              recentJobs.map((job) => {
                const conf = STATUS_CONFIGS[job.status] || STATUS_CONFIGS.WISHLIST;
                return (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-150 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-200 truncate">{job.jobTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{job.companyName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Match Score indicator */}
                      {job.aiAnalysis?.matchScore != null && (
                        <div className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/10">
                          <Sparkles size={11} />
                          <span className="font-semibold">{job.aiAnalysis.matchScore}%</span>
                        </div>
                      )}
                      
                      <span className={`status-badge text-[10px] ${conf.color} ${conf.bg} border ${conf.border}`}>
                        {conf.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
}
