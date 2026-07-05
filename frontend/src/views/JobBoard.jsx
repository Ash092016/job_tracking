import { useState, useEffect, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import {
  Plus, Loader2, AlertCircle,
  Briefcase, ChevronDown, Trash2,
  ExternalLink, Sparkles,
} from "lucide-react";
import api          from "../lib/axios.js";
import AddJobModal  from "../components/AddJobModal.jsx";

const COLUMNS = [
  {
    status:    "WISHLIST",
    label:     "Wishlist",
    color:     "text-slate-400",
    dot:       "bg-slate-400",
    border:    "border-slate-400/30",
    headerBg:  "bg-slate-400/10",
  },
  {
    status:    "APPLIED",
    label:     "Applied",
    color:     "text-brand-400",
    dot:       "bg-brand-400",
    border:    "border-brand-400/30",
    headerBg:  "bg-brand-400/10",
  },
  {
    status:    "INTERVIEWING",
    label:     "Interviewing",
    color:     "text-amber-400",
    dot:       "bg-amber-400",
    border:    "border-amber-400/30",
    headerBg:  "bg-amber-400/10",
  },
  {
    status:    "OFFERED",
    label:     "Offered",
    color:     "text-green-400",
    dot:       "bg-green-400",
    border:    "border-green-400/30",
    headerBg:  "bg-green-400/10",
  },
  {
    status:    "REJECTED",
    label:     "Rejected",
    color:     "text-red-400",
    dot:       "bg-red-400",
    border:    "border-red-400/30",
    headerBg:  "bg-red-400/10",
  },
];

const cx = (...c) => c.filter(Boolean).join(" ");

function groupByStatus(applications) {
  const groups = Object.fromEntries(COLUMNS.map((c) => [c.status, []]));
  applications.forEach((app) => {
    if (groups[app.status]) groups[app.status].push(app);
  });
  return groups;
}

function formatSalary(cents) {
  if (!cents) return null;
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function timeAgo(dateString) {
  if (!dateString) return null;
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days <  30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function AppCard({ app, onStatusChange, onDelete, onClick }) {
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting,       setDeleting]       = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === app.status) return;
    setChangingStatus(true);
    try {
      await api.put(`/jobs/${app._id}`, { status: newStatus });
      onStatusChange?.();
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${app.jobTitle}" at ${app.companyName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/jobs/${app._id}`);
      onDelete?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="
        group relative rounded-xl bg-slate-800 border border-slate-700/60
        p-4 cursor-pointer
        hover:border-brand-500/40 hover:bg-slate-750
        transition-all duration-150 shadow-glass
      "
    >
      {/* AI badge — shown if analysis exists */}
      {app.aiAnalysis && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-brand-400 bg-brand-600/15 border border-brand-500/20 rounded-full px-2 py-0.5">
          <Sparkles size={10} />
          {app.aiAnalysis.matchScore}%
        </div>
      )}

      {/* Company + Title */}
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate pr-12">
        {app.companyName}
      </p>
      <h3 className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug truncate pr-12">
        {app.jobTitle}
      </h3>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
        {app.salaryExpectation && (
          <span className="text-xs text-green-400 font-medium">
            {formatSalary(app.salaryExpectation)}
          </span>
        )}
        {app.appliedDate && (
          <span className="text-xs text-slate-500">
            Applied {timeAgo(app.appliedDate)}
          </span>
        )}
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-0.5 ml-auto"
          >
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Status changer + delete — visible on hover */}
      <div
        className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inline status dropdown */}
        <div className="relative flex-1">
          <select
            className="w-full text-xs bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-300 appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            value={app.status}
            disabled={changingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {COLUMNS.map(({ status, label }) => (
              <option key={status} value={status}>{label}</option>
            ))}
          </select>
          {changingStatus
            ? <Loader2 size={10} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
            : <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          }
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          aria-label="Delete application"
        >
          {deleting
            ? <Loader2 size={13} className="animate-spin" />
            : <Trash2 size={13} />
          }
        </button>
      </div>
    </div>
  );
}


function KanbanColumn({ column, cards, onRefresh }) {
  const navigate = useNavigate();
  const { status, label, color, dot, border, headerBg } = column;

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] w-full flex-shrink-0">

      {/* Column header */}
      <div className={cx(
        "flex items-center justify-between px-3 py-2.5 rounded-xl mb-3",
        headerBg, "border", border
      )}>
        <div className="flex items-center gap-2">
          <span className={cx("w-2 h-2 rounded-full", dot)} />
          <span className={cx("text-xs font-semibold uppercase tracking-wider", color)}>
            {label}
          </span>
        </div>
        <span className={cx(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          color, "bg-current/10"
        )}>
          {cards.length}
        </span>
      </div>

      {/* Card stack */}
      <div className="flex flex-col gap-3 flex-1">
        {cards.length === 0 ? (
          <div className={cx(
            "flex items-center justify-center h-24 rounded-xl border-2 border-dashed",
            "text-xs text-slate-600",
            border
          )}>
            No applications
          </div>
        ) : (
          cards.map((app) => (
            <AppCard
              key={app._id}
              app={app}
              onStatusChange={onRefresh}
              onDelete={onRefresh}
              onClick={() => navigate(`/jobs/${app._id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function JobBoard() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get("/jobs");
      setApplications(data.data.applications ?? []);
    } catch {
      setFetchError("Could not load applications. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const grouped = groupByStatus(applications);
  const total   = applications.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={24} className="text-red-400" />
        <p className="text-sm text-red-400">{fetchError}</p>
        <button onClick={fetchApplications} className="btn-ghost text-sm">
          Try again
        </button>
      </div>
    );
  }


  return (
    <div className="animate-slide-up">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Applications</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {total === 0
              ? "No applications yet — add your first one."
              : `${total} application${total !== 1 ? "s" : ""} across ${COLUMNS.length} stages`
            }
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          Add application
        </button>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/15 border border-brand-500/30 flex items-center justify-center">
            <Briefcase size={24} className="text-brand-400" />
          </div>
          <div>
            <p className="text-slate-300 font-medium">No applications yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Start tracking by adding your first application.
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={15} />
            Add your first application
          </button>
        </div>
      ) : (
        /* ── Kanban board (horizontal scroll on narrow viewports) ── */
        <div className="overflow-x-auto -mx-1 px-1 pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                column={col}
                cards={grouped[col.status]}
                onRefresh={fetchApplications}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchApplications}
      />
    </div>
  );
}
