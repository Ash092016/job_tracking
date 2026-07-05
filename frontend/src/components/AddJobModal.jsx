import { useState, useEffect, useRef, useCallback } from "react";
import { X, Building2, FileText, DollarSign, Link, StickyNote, Loader2, ChevronDown } from "lucide-react";
import api from "../lib/axios.js";

const STATUS_OPTIONS = [
  { value: "WISHLIST",     label: "Wishlist"     },
  { value: "APPLIED",      label: "Applied"      },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFERED",      label: "Offered"      },
  { value: "REJECTED",     label: "Rejected"     },
];

const EMPTY_FORM = {
  companyName:       "",
  jobTitle:          "",
  jobUrl:            "",
  status:            "WISHLIST",
  salaryExpectation: "",
  rawJobDescription: "",
  notes:             "",
};

const cx = (...c) => c.filter(Boolean).join(" ");

function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

const inputErr = (err) => cx("input", err && "border-red-500/60 focus:border-red-500");

export default function AddJobModal({ isOpen, onClose, onSuccess }) {
  const [form,         setForm]         = useState({ ...EMPTY_FORM });
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError,  setServerError]  = useState("");

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY_FORM });
      setErrors({});
      setServerError("");
      setTimeout(() => firstInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: null }));
    if (serverError) setServerError("");
  };

  function validate() {
    const e = {};

    if (!form.companyName.trim())
      e.companyName = "Company name is required.";

    if (!form.jobTitle.trim())
      e.jobTitle = "Job title is required.";

    if (form.jobUrl.trim() && !/^https?:\/\/.+/.test(form.jobUrl.trim()))
      e.jobUrl = "Must be a valid URL starting with http:// or https://";

    if (form.salaryExpectation !== "") {
      const n = Number(form.salaryExpectation);
      if (isNaN(n) || n < 0 || !Number.isInteger(n))
        e.salaryExpectation = "Must be a positive whole number (e.g. 150000).";
    }

    return e;
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setIsSubmitting(true);
    setServerError("");

    try {
      const payload = {
        companyName:       form.companyName.trim(),
        jobTitle:          form.jobTitle.trim(),
        status:            form.status,
        jobUrl:            form.jobUrl.trim()            || undefined,
        rawJobDescription: form.rawJobDescription.trim() || undefined,
        notes:             form.notes.trim()             || undefined,
        salaryExpectation: form.salaryExpectation !== ""
          ? Number(form.salaryExpectation)
          : undefined,
      };

      await api.post("/jobs", payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to create application. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* ── Modal panel ─────────────────────────────────── */}
      <div className="
        relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
        card animate-slide-up
      ">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10 rounded-t-2xl">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-slate-100">
              Add new application
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste the full job description for the best AI analysis results.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">

          {/* Row: Company + Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Company</Label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  ref={firstInputRef}
                  className={cx(inputErr(errors.companyName), "pl-10")}
                  value={form.companyName}
                  onChange={set("companyName")}
                  placeholder="Stripe"
                />
              </div>
              <FieldError message={errors.companyName} />
            </div>

            <div>
              <Label required>Job title / role</Label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  className={cx(inputErr(errors.jobTitle), "pl-10")}
                  value={form.jobTitle}
                  onChange={set("jobTitle")}
                  placeholder="Senior Software Engineer"
                />
              </div>
              <FieldError message={errors.jobTitle} />
            </div>
          </div>

          {/* Row: Status + Target Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Application status</Label>
              <div className="relative">
                <select
                  className="input appearance-none pr-9"
                  value={form.status}
                  onChange={set("status")}
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <Label>Target salary <span className="text-slate-600 normal-case font-normal">(whole dollars)</span></Label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  className={cx(inputErr(errors.salaryExpectation), "pl-10")}
                  value={form.salaryExpectation}
                  onChange={set("salaryExpectation")}
                  placeholder="150000"
                  type="number"
                  min="0"
                  step="1000"
                />
              </div>
              <FieldError message={errors.salaryExpectation} />
            </div>
          </div>

          {/* Job URL */}
          <div>
            <Label>Job posting URL</Label>
            <div className="relative">
              <Link size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                className={cx(inputErr(errors.jobUrl), "pl-10")}
                value={form.jobUrl}
                onChange={set("jobUrl")}
                placeholder="https://company.com/careers/job-id"
                type="url"
              />
            </div>
            <FieldError message={errors.jobUrl} />
          </div>

          {/* Raw Job Description — the AI prompt input */}
          <div>
            <Label>Job description</Label>
            <p className="text-xs text-slate-500 mb-2">
              Paste the full JD here. The AI analysis reads this directly — more detail = better score.
            </p>
            <textarea
              className="input resize-none font-mono text-xs leading-relaxed"
              rows={10}
              value={form.rawJobDescription}
              onChange={set("rawJobDescription")}
              placeholder="Paste the full job description here…

Example:
We are looking for a Senior Software Engineer to join our
Payments Infrastructure team. You will build systems that
process billions of dollars daily…"
            />
            {/* Live character count — soft guidance only */}
            <p className={cx(
              "text-xs mt-1 text-right transition-colors",
              form.rawJobDescription.length < 200 ? "text-slate-600" : "text-green-500/70"
            )}>
              {form.rawJobDescription.length} chars
              {form.rawJobDescription.length < 200 && " — longer descriptions improve AI accuracy"}
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label>Personal notes</Label>
            <div className="relative">
              <StickyNote size={15} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              <textarea
                className="input resize-none pl-10"
                rows={2}
                value={form.notes}
                onChange={set("notes")}
                placeholder="Referral from LinkedIn, dream company, recruiter name…"
              />
            </div>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
              {serverError}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" />Saving…</>
              ) : (
                "Add application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
