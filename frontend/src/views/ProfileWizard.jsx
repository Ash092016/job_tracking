import { useState, useEffect, useCallback } from "react";
import {
  User, GraduationCap, Briefcase,
  Plus, Trash2, Save, Loader2,
  Check, AlertCircle, ChevronRight,
} from "lucide-react";
import api from "../lib/axios.js";

const TABS = [
  { id: 0, label: "Personal Details",      Icon: User          },
  { id: 1, label: "Education & Certs",     Icon: GraduationCap },
  { id: 2, label: "Work Experience",       Icon: Briefcase     },
];

function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <AlertCircle size={11} /> {message}
    </p>
  );
}

function SaveFeedback({ status }) {
  if (status === "saving")  return <span className="flex items-center gap-1.5 text-xs text-slate-400"><Loader2 size={13} className="animate-spin" />Saving…</span>;
  if (status === "saved")   return <span className="flex items-center gap-1.5 text-xs text-green-400"><Check size={13} />Saved</span>;
  if (status === "error")   return <span className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} />Save failed</span>;
  return null;
}

const cx = (...c) => c.filter(Boolean).join(" ");
const inputCls = (err) => cx(
  "input",
  err && "border-red-500/60 focus:border-red-500 focus:ring-red-500/40"
);

function PersonalTab({ profile, onSaved }) {
  const [form, setForm] = useState({
    firstName:    profile?.firstName    ?? "",
    lastName:     profile?.lastName     ?? "",
    phone:        profile?.phone        ?? "",
    githubUrl:    profile?.githubUrl    ?? "",
    linkedinUrl:  profile?.linkedinUrl  ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
    resumeText:   profile?.resumeText   ?? "",
  });
  const [errors,  setErrors]  = useState({});
  const [status,  setStatus]  = useState("idle"); 
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | success | error
  const [uploadError,  setUploadError]  = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName:    profile.firstName    ?? "",
      lastName:     profile.lastName     ?? "",
      phone:        profile.phone        ?? "",
      githubUrl:    profile.githubUrl    ?? "",
      linkedinUrl:  profile.linkedinUrl  ?? "",
      portfolioUrl: profile.portfolioUrl ?? "",
      resumeText:   profile.resumeText   ?? "",
    });
  }, [profile]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: null }));
  };

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim())  e.lastName  = "Last name is required.";

    const urlFields = ["githubUrl", "linkedinUrl", "portfolioUrl"];
    urlFields.forEach((f) => {
      const v = form[f].trim();
      if (v && !/^https?:\/\/.+/.test(v)) {
        e[f] = "Must be a valid URL starting with http:// or https://";
      }
    });
    return e;
  }

  async function handleSave(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setStatus("saving");
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim() || null])
      );
      await api.put("/profile", payload);
      setStatus("saved");
      onSaved?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await api.post("/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("success");
      onSaved?.(); // trigger reload to fetch new parsed resumeText
      setTimeout(() => setUploadStatus("idle"), 2500);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to upload and parse PDF.";
      setUploadError(msg);
      setUploadStatus("error");
    }
  }

  return (
    <form onSubmit={handleSave} noValidate className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>First name</Label>
          <input className={inputCls(errors.firstName)} value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
          <FieldError message={errors.firstName} />
        </div>
        <div>
          <Label required>Last name</Label>
          <input className={inputCls(errors.lastName)} value={form.lastName} onChange={set("lastName")} placeholder="Doe" />
          <FieldError message={errors.lastName} />
        </div>
      </div>

      <div>
        <Label>Phone number</Label>
        <input className="input" value={form.phone} onChange={set("phone")} placeholder="+1-555-000-0000" type="tel" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>GitHub URL</Label>
          <input className={inputCls(errors.githubUrl)} value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/username" />
          <FieldError message={errors.githubUrl} />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <input className={inputCls(errors.linkedinUrl)} value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/username" />
          <FieldError message={errors.linkedinUrl} />
        </div>
      </div>

      <div>
        <Label>Portfolio URL</Label>
        <input className={inputCls(errors.portfolioUrl)} value={form.portfolioUrl} onChange={set("portfolioUrl")} placeholder="https://myportfolio.dev" />
        <FieldError message={errors.portfolioUrl} />
      </div>

      {/* PDF Resume Uploader */}
      <div className="space-y-2 border-t border-slate-700/60 pt-5">
        <Label>Upload PDF Resume</Label>
        <div className="flex items-center gap-4 flex-wrap">
          <label className={cx(
            "btn-ghost text-xs px-4 py-2.5 cursor-pointer flex items-center gap-2",
            uploadStatus === "uploading" && "opacity-60 cursor-not-allowed"
          )}>
            {uploadStatus === "uploading" ? (
              <><Loader2 size={13} className="animate-spin" />Uploading & Parsing...</>
            ) : uploadStatus === "success" ? (
              <><Check size={13} className="text-green-400" />Uploaded</>
            ) : (
              "Choose PDF Resume"
            )}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadStatus === "uploading"}
            />
          </label>
          <span className="text-xs text-slate-500">Maximum size 5MB. Automatically extracts text.</span>
        </div>
        {uploadStatus === "error" && uploadError && (
          <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{uploadError}</p>
        )}
      </div>

      {/* Copy-paste Resume Textarea */}
      <div className="space-y-2">
        <Label>Resume Text content</Label>
        <textarea
          className="input resize-none font-mono text-xs leading-relaxed"
          rows={10}
          value={form.resumeText}
          onChange={set("resumeText")}
          placeholder="Paste your plain-text resume here…

Example:
Jane Doe
Senior Full-Stack Engineer
Skills: React, Node.js, Express, MongoDB...

Experience:
- Software Engineer at Stripe (2022 - Present)
  Built payments integrations and scaled APIs..."
        />
        <p className="text-xs text-slate-500">
          Paste your resume text directly or upload a PDF above to auto-populate this box.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
        <SaveFeedback status={status} />
        <button type="submit" disabled={status === "saving"} className="btn-primary ml-auto">
          {status === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save details
        </button>
      </div>
    </form>
  );
}

const EMPTY_QUAL = {
  type: "EDUCATION", institution: "", major: "",
  startDate: "", endDate: "", gpa: "",
};

function EducationTab({ profile, onSaved }) {
  const [items,  setItems]  = useState(profile?.qualifications ?? []);
  const [errors, setErrors] = useState({}); 
  const [status, setStatus] = useState("idle");
  const [adding, setAdding] = useState(false);
  const [draft,  setDraft]  = useState({ ...EMPTY_QUAL });
  const [draftErrors, setDraftErrors] = useState({});

  useEffect(() => {
    setItems(profile?.qualifications ?? []);
  }, [profile]);

  const setDraftField = (field) => (e) => {
    setDraft((p) => ({ ...p, [field]: e.target.value }));
    setDraftErrors((p) => ({ ...p, [field]: null }));
  };

  function validateDraft() {
    const e = {};
    if (!draft.institution.trim()) e.institution = "Institution is required.";
    if (!draft.type)               e.type        = "Type is required.";
    if (draft.gpa && isNaN(Number(draft.gpa))) e.gpa = "GPA must be a number.";
    if (draft.gpa && (Number(draft.gpa) < 0 || Number(draft.gpa) > 4))
      e.gpa = "GPA must be between 0 and 4.";
    return e;
  }

  async function handleAddQual(e) {
    e.preventDefault();
    const e2 = validateDraft();
    if (Object.keys(e2).length) { setDraftErrors(e2); return; }

    setStatus("saving");
    try {
      const payload = {
        ...draft,
        gpa:       draft.gpa       ? Number(draft.gpa)      : undefined,
        startDate: draft.startDate || undefined,
        endDate:   draft.endDate   || undefined,
      };
      const { data } = await api.post("/profile/qualifications", payload);
      setItems(data.data.qualifications);
      setDraft({ ...EMPTY_QUAL });
      setAdding(false);
      setStatus("saved");
      onSaved?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function handleDelete(qualId) {
    setStatus("saving");
    try {
      const { data } = await api.delete(`/profile/qualifications/${qualId}`);
      setItems(data.data.qualifications);
      setStatus("saved");
      onSaved?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing qualifications list */}
      {items.length === 0 && !adding && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No qualifications added yet.
        </div>
      )}

      {items.map((q) => (
        <div key={q._id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-700/40 border border-slate-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cx(
                "status-badge text-xs",
                q.type === "EDUCATION"
                  ? "bg-brand-600/20 text-brand-300"
                  : "bg-amber-500/20 text-amber-300"
              )}>
                {q.type === "EDUCATION" ? "Education" : "Certification"}
              </span>
              <span className="text-sm font-medium text-slate-100 truncate">
                {q.institution}
              </span>
            </div>
            {q.major && (
              <p className="text-xs text-slate-400 mt-1">{q.major}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              {q.startDate && <span>{new Date(q.startDate).getFullYear()}</span>}
              {q.startDate && q.endDate && <span>→</span>}
              {q.endDate   && <span>{new Date(q.endDate).getFullYear()}</span>}
              {q.gpa       && <span>GPA: {q.gpa}</span>}
            </div>
          </div>
          <button
            onClick={() => handleDelete(q._id)}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* Add new qualification form */}
      {adding ? (
        <form onSubmit={handleAddQual} noValidate className="p-4 rounded-xl border border-brand-500/40 bg-brand-600/5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Type</Label>
              <select className="input" value={draft.type} onChange={setDraftField("type")}>
                <option value="EDUCATION">Education</option>
                <option value="CERTIFICATION">Certification</option>
              </select>
              <FieldError message={draftErrors.type} />
            </div>
            <div>
              <Label required>Institution</Label>
              <input className={inputCls(draftErrors.institution)} value={draft.institution} onChange={setDraftField("institution")} placeholder="State University" />
              <FieldError message={draftErrors.institution} />
            </div>
          </div>

          <div>
            <Label>Degree / Certificate title</Label>
            <input className="input" value={draft.major} onChange={setDraftField("major")} placeholder="B.Sc. Computer Science" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Start date</Label>
              <input className="input" type="date" value={draft.startDate} onChange={setDraftField("startDate")} />
            </div>
            <div>
              <Label>End date</Label>
              <input className="input" type="date" value={draft.endDate} onChange={setDraftField("endDate")} />
            </div>
            <div>
              <Label>GPA</Label>
              <input className={inputCls(draftErrors.gpa)} value={draft.gpa} onChange={setDraftField("gpa")} placeholder="3.8" type="number" step="0.01" min="0" max="4" />
              <FieldError message={draftErrors.gpa} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => { setAdding(false); setDraft({ ...EMPTY_QUAL }); setDraftErrors({}); }} className="btn-ghost text-xs px-3 py-2">
              Cancel
            </button>
            <button type="submit" disabled={status === "saving"} className="btn-primary text-xs px-3 py-2">
              {status === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add qualification
            </button>
            <SaveFeedback status={status} />
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-600 text-sm text-slate-500 hover:border-brand-500/60 hover:text-brand-400 transition-colors">
          <Plus size={15} />
          Add qualification
        </button>
      )}

      {!adding && (
        <div className="flex justify-end">
          <SaveFeedback status={status} />
        </div>
      )}
    </div>
  );
}

const EMPTY_EXP = {
  company: "", role: "", startDate: "", endDate: "",
  description: "", skillsUsed: "",
};

function ExperienceTab({ profile, onSaved }) {
  const [items,  setItems]  = useState(profile?.experiences ?? []);
  const [adding, setAdding] = useState(false);
  const [draft,  setDraft]  = useState({ ...EMPTY_EXP });
  const [draftErrors, setDraftErrors] = useState({});
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    setItems(profile?.experiences ?? []);
  }, [profile]);

  const setDraftField = (field) => (e) => {
    setDraft((p) => ({ ...p, [field]: e.target.value }));
    setDraftErrors((p) => ({ ...p, [field]: null }));
  };

  function validateDraft() {
    const e = {};
    if (!draft.company.trim()) e.company = "Company name is required.";
    if (!draft.role.trim())    e.role    = "Role / title is required.";
    return e;
  }

  async function handleAddExp(e) {
    e.preventDefault();
    const e2 = validateDraft();
    if (Object.keys(e2).length) { setDraftErrors(e2); return; }

    setStatus("saving");
    try {
      const skillsArray = draft.skillsUsed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        company:     draft.company.trim(),
        role:        draft.role.trim(),
        description: draft.description.trim() || undefined,
        skillsUsed:  skillsArray,
        startDate:   draft.startDate || undefined,
        endDate:     draft.endDate   || undefined,
      };

      const { data } = await api.post("/profile/experiences", payload);
      setItems(data.data.experiences);
      setDraft({ ...EMPTY_EXP });
      setAdding(false);
      setStatus("saved");
      onSaved?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function handleDelete(expId) {
    setStatus("saving");
    try {
      const { data } = await api.delete(`/profile/experiences/${expId}`);
      setItems(data.data.experiences);
      setStatus("saved");
      onSaved?.();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && !adding && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No experience entries yet.
        </div>
      )}

      {items.map((exp) => (
        <div key={exp._id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-700/40 border border-slate-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-100">{exp.role}</span>
              <ChevronRight size={12} className="text-slate-500" />
              <span className="text-sm text-slate-400">{exp.company}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              {exp.startDate && <span>{new Date(exp.startDate).getFullYear()}</span>}
              <span>→</span>
              {exp.endDate ? <span>{new Date(exp.endDate).getFullYear()}</span> : <span className="text-green-400">Present</span>}
            </div>
            {exp.skillsUsed?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {exp.skillsUsed.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-600/60 text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => handleDelete(exp._id)} className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAddExp} noValidate className="p-4 rounded-xl border border-brand-500/40 bg-brand-600/5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Company</Label>
              <input className={inputCls(draftErrors.company)} value={draft.company} onChange={setDraftField("company")} placeholder="Acme Corp" />
              <FieldError message={draftErrors.company} />
            </div>
            <div>
              <Label required>Role / title</Label>
              <input className={inputCls(draftErrors.role)} value={draft.role} onChange={setDraftField("role")} placeholder="Software Engineer II" />
              <FieldError message={draftErrors.role} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start date</Label>
              <input className="input" type="date" value={draft.startDate} onChange={setDraftField("startDate")} />
            </div>
            <div>
              <Label>End date <span className="text-slate-600 normal-case font-normal">(leave blank = current)</span></Label>
              <input className="input" type="date" value={draft.endDate} onChange={setDraftField("endDate")} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              className="input resize-none"
              rows={3}
              value={draft.description}
              onChange={setDraftField("description")}
              placeholder="Key achievements and responsibilities…"
            />
          </div>

          <div>
            <Label>Skills used <span className="text-slate-600 normal-case font-normal">(comma-separated)</span></Label>
            <input className="input" value={draft.skillsUsed} onChange={setDraftField("skillsUsed")} placeholder="React, Node.js, PostgreSQL, AWS" />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => { setAdding(false); setDraft({ ...EMPTY_EXP }); setDraftErrors({}); }} className="btn-ghost text-xs px-3 py-2">
              Cancel
            </button>
            <button type="submit" disabled={status === "saving"} className="btn-primary text-xs px-3 py-2">
              {status === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add experience
            </button>
            <SaveFeedback status={status} />
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-600 text-sm text-slate-500 hover:border-brand-500/60 hover:text-brand-400 transition-colors">
          <Plus size={15} />
          Add experience
        </button>
      )}

      {!adding && (
        <div className="flex justify-end">
          <SaveFeedback status={status} />
        </div>
      )}
    </div>
  );
}

export default function ProfileWizard() {
  const [activeTab, setActiveTab] = useState(0);
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [fetchError,setFetchError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/profile");
      setProfile(data.data.profile ?? null);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setFetchError("Could not load profile. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm gap-2">
        <AlertCircle size={16} /> {fetchError}
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto animate-slide-up">

      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Your Profile</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Keep your profile complete — the AI uses this data to score your applications.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cx(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
            )}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Active tab panel */}
      <div className="card p-6">
        {activeTab === 0 && (
          <PersonalTab  profile={profile} onSaved={fetchProfile} />
        )}
        {activeTab === 1 && (
          <EducationTab profile={profile} onSaved={fetchProfile} />
        )}
        {activeTab === 2 && (
          <ExperienceTab profile={profile} onSaved={fetchProfile} />
        )}
      </div>
    </div>
  );
}
