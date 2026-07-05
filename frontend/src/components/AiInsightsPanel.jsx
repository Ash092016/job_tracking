import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate }                    from "react-router-dom";
import {
  ArrowLeft, Sparkles, Loader2, AlertCircle,
  CheckCircle2, XCircle, Tag, Lightbulb,
  Building2, Calendar, DollarSign, StickyNote,
  RefreshCw, ExternalLink,
} from "lucide-react";
import api            from "../lib/axios.js";
import SkeletonLoader from "./SkeletonLoader.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

const STATUS_STYLES = {
  WISHLIST:     "bg-slate-500/20  text-slate-300  border-slate-500/30",
  APPLIED:      "bg-brand-600/20  text-brand-300  border-brand-500/30",
  INTERVIEWING: "bg-amber-500/20  text-amber-300  border-amber-500/30",
  OFFERED:      "bg-green-500/20  text-green-300  border-green-500/30",
  REJECTED:     "bg-red-500/20    text-red-300    border-red-500/30",
};

const STATUS_LABELS = {
  WISHLIST: "Wishlist", APPLIED: "Applied",
  INTERVIEWING: "Interviewing", OFFERED: "Offered", REJECTED: "Rejected",
};

function scoreColour(score) {
  if (score >= 70) return {
    stroke: "#10b981",   
    text:   "text-emerald-400",
    bg:     "bg-emerald-500/10",
    border: "border-emerald-500/25",
    label:  "Strong match",
  };
  if (score >= 45) return {
    stroke: "#f59e0b",   
    text:   "text-amber-400",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/25",
    label:  "Partial match",
  };
  return {
    stroke: "#ef4444",   
    text:   "text-red-400",
    bg:     "bg-red-500/10",
    border: "border-red-500/25",
    label:  "Significant gaps",
  };
}

function formatSalary(cents) {
  if (!cents) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function ScoreGauge({ score }) {
  const colour  = scoreColour(score);
  const radius  = 58;                        
  const stroke  = 10;                        
  const circum  = 2 * Math.PI * radius;      
  const centre  = 80;                        
  const gap     = circum * 0.25;             
  const arcLen  = circum - gap;
  const offset  = arcLen - (score / 100) * arcLen;

  const [animOffset, setAnimOffset] = useState(arcLen);
  useEffect(() => {
    const t = setTimeout(() => setAnimOffset(offset), 80);
    return () => clearTimeout(t);
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="160" height="160"
        viewBox="0 0 160 160"
        role="img"
        aria-label={`Match score: ${score} out of 100`}
      >
        {/* Track arc (background) */}
        <circle
          cx={centre} cy={centre} r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${gap}`}
          strokeDashoffset={circum * 0.125}   
          strokeLinecap="round"
          transform={`rotate(135 ${centre} ${centre})`}
        />
        {/* Score arc (foreground) */}
        <circle
          cx={centre} cy={centre} r={radius}
          fill="none"
          stroke={colour.stroke}
          strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${gap}`}
          strokeDashoffset={animOffset}
          strokeLinecap="round"
          transform={`rotate(135 ${centre} ${centre})`}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        {/* Score number */}
        <text
          x={centre} y={centre - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="28"
          fontWeight="700"
          fill={colour.stroke}
          fontFamily="inherit"
        >
          {score}
        </text>
        {/* "/100" sub-label */}
        <text
          x={centre} y={centre + 20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          fontWeight="400"
          fill="#64748b"
          fontFamily="inherit"
        >
          / 100
        </text>
      </svg>

      {/* Score label pill */}
      <span className={cx(
        "text-xs font-semibold px-3 py-1 rounded-full border",
        colour.text, colour.bg, colour.border
      )}>
        {colour.label}
      </span>
    </div>
  );
}

function DosCard({ dos }) {
  if (!dos?.length) return null;
  return (
    <div className="card p-5 border-green-500/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
          <CheckCircle2 size={15} className="text-green-400" />
        </div>
        <h3 className="text-sm font-semibold text-green-300">What to do</h3>
        <span className="ml-auto text-xs text-green-500/60 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
          {dos.length} actions
        </span>
      </div>
      <ul className="space-y-3">
        {dos.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center shrink-0 font-medium">
              {i + 1}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DontsCard({ donts }) {
  if (!donts?.length) return null;
  return (
    <div className="card p-5 border-red-500/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
          <XCircle size={15} className="text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-red-300">What to avoid</h3>
        <span className="ml-auto text-xs text-red-500/60 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
          {donts.length} flags
        </span>
      </div>
      <ul className="space-y-3">
        {donts.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <XCircle size={14} className="text-red-400/70 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TAG_TIERS = [
  "bg-amber-500/20 text-amber-300 border-amber-500/30 text-sm font-medium px-3 py-1.5",
  "bg-amber-500/12 text-amber-400 border-amber-500/20 text-xs font-medium px-2.5 py-1",
  "bg-slate-700/60  text-slate-400 border-slate-600/40  text-xs font-normal px-2.5 py-1",
];

function KeywordCloud({ keywords }) {
  if (!keywords?.length) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Tag size={14} className="text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-amber-300">Missing keywords</h3>
        <span className="ml-auto text-xs text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          {keywords.length} gaps
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <span
            key={kw}
            className={cx(
              "rounded-full border transition-all duration-150",
              "hover:scale-105 hover:shadow-glow-amber cursor-default",
              TAG_TIERS[Math.min(i, TAG_TIERS.length - 1)]
            )}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

function TailoringCard({ suggestions }) {
  if (!suggestions?.trim()) return null;

  const paragraphs = suggestions
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="card p-5 border-brand-500/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-brand-600/15 flex items-center justify-center">
          <Lightbulb size={14} className="text-brand-400" />
        </div>
        <h3 className="text-sm font-semibold text-brand-300">Tailoring suggestions</h3>
      </div>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
        ))}
      </div>
    </div>
  );
}

function JobDetailPanel({ application, onAnalyse, isAnalysing }) {
  const colour = scoreColour(application.aiAnalysis?.matchScore ?? 0);

  return (
    <div className="space-y-4">

      {/* Company + Title */}
      <div className="card p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Building2 size={11} /> Company
        </p>
        <h2 className="text-xl font-bold text-slate-100">{application.companyName}</h2>

        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-4 mb-1">
          Role
        </p>
        <p className="text-base font-semibold text-slate-200">{application.jobTitle}</p>

        {/* Status badge */}
        <div className="flex items-center gap-2 mt-4">
          <span className={cx(
            "status-badge border",
            STATUS_STYLES[application.status] ?? STATUS_STYLES.WISHLIST
          )}>
            {STATUS_LABELS[application.status] ?? application.status}
          </span>
          {application.aiAnalysis && (
            <span className={cx(
              "status-badge border",
              colour.bg, colour.text, colour.border
            )}>
              <Sparkles size={9} className="mr-0.5" />
              {application.aiAnalysis.matchScore}% match
            </span>
          )}
        </div>
      </div>

      {/* Meta: Applied date + Salary */}
      <div className="card p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Calendar size={11} /> Applied
          </p>
          <p className="text-sm text-slate-300">
            {application.appliedDate ? formatDate(application.appliedDate) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <DollarSign size={11} /> Target salary
          </p>
          <p className="text-sm text-slate-300 font-medium">
            {formatSalary(application.salaryExpectation) ?? "—"}
          </p>
        </div>
      </div>

      {/* Job URL */}
      {application.jobUrl && (
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors px-1"
        >
          <ExternalLink size={13} />
          View original job posting
        </a>
      )}

      {/* Notes */}
      {application.notes && (
        <div className="card p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <StickyNote size={11} /> Notes
          </p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {application.notes}
          </p>
        </div>
      )}

      {/* AI analysis timestamp */}
      {application.aiAnalysis?.analyzedAt && (
        <p className="text-xs text-slate-600 px-1">
          Last analysed {formatDate(application.aiAnalysis.analyzedAt)}
        </p>
      )}

      {/* Analyse / Re-analyse CTA */}
      <button
        onClick={onAnalyse}
        disabled={isAnalysing || !application.rawJobDescription}
        className={cx(
          "w-full btn-primary",
          !application.rawJobDescription && "opacity-40 cursor-not-allowed"
        )}
        title={!application.rawJobDescription
          ? "Add a job description first to enable AI analysis"
          : undefined
        }
      >
        {isAnalysing ? (
          <><Loader2 size={15} className="animate-spin" />Analysing…</>
        ) : application.aiAnalysis ? (
          <><RefreshCw size={15} />Re-analyse with AI</>
        ) : (
          <><Sparkles size={15} />Analyse with AI</>
        )}
      </button>

      {!application.rawJobDescription && (
        <p className="text-xs text-slate-600 text-center -mt-1">
          Add a job description to enable AI analysis.
        </p>
      )}
    </div>
  );
}

function AiResultsPanel({ aiAnalysis }) {
  if (!aiAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/15 border border-brand-500/30 flex items-center justify-center">
          <Sparkles size={20} className="text-brand-400" />
        </div>
        <p className="text-slate-300 font-medium">No analysis yet</p>
        <p className="text-sm text-slate-500 max-w-xs">
          Click "Analyse with AI" to get a personalised match score and tailoring recommendations.
        </p>
      </div>
    );
  }

  const { matchScore, dos, donts, missingKeywords, tailoringSuggestions } = aiAnalysis;

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Score gauge */}
      <div className="card p-6 flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} className="text-brand-400" />
          AI Match Score
        </p>
        <ScoreGauge score={matchScore} />
      </div>

      {/* Dos */}
      <DosCard dos={dos} />

      {/* Don'ts */}
      <DontsCard donts={donts} />

      {/* Missing keywords */}
      <KeywordCloud keywords={missingKeywords} />

      {/* Tailoring suggestions */}
      <TailoringCard suggestions={tailoringSuggestions} />
    </div>
  );
}

export default function AiInsightsPanel() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [application,  setApplication]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(null);
  const [isAnalysing,  setIsAnalysing]  = useState(false);
  const [analyseError, setAnalyseError] = useState(null);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setApplication(data.data.application);
    } catch (err) {
      setFetchError(
        err?.response?.status === 404
          ? "Application not found."
          : "Could not load application. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchApplication(); }, [fetchApplication]);

  const handleAnalyse = useCallback(async () => {
    setIsAnalysing(true);
    setAnalyseError(null);
    try {
      const { data } = await api.post(`/jobs/${id}/analyse`);
      setApplication(data.data.application);
    } catch (err) {
      setAnalyseError(
        err?.response?.data?.message ?? "AI analysis failed. Please try again."
      );
    } finally {
      setIsAnalysing(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="mb-6">
          <div className="h-8 w-40 bg-slate-700/50 rounded-lg animate-pulse" />
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={24} className="text-red-400" />
        <p className="text-sm text-red-400">{fetchError}</p>
        <button onClick={fetchApplication} className="btn-ghost text-sm">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Back navigation */}
      <button
        onClick={() => navigate("/jobs")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors mb-6 group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        All applications
      </button>

      {/* AI analysis error banner */}
      {analyseError && (
        <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 animate-fade-in">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Analysis failed</p>
            <p className="text-red-400/80 mt-0.5">{analyseError}</p>
          </div>
          <button
            onClick={() => setAnalyseError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Split-screen layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left — Job detail */}
        <div className="lg:w-2/5">
          <JobDetailPanel
            application={application}
            onAnalyse={handleAnalyse}
            isAnalysing={isAnalysing}
          />
        </div>

        {/* Right — AI insights (skeleton while analysing) */}
        <div className="lg:flex-1">
          {isAnalysing ? (
            <SkeletonLoader rightOnly />
          ) : (
            <AiResultsPanel aiAnalysis={application?.aiAnalysis} />
          )}
        </div>
      </div>
    </div>
  );
}
