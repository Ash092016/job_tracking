import { useState }          from "react";
import { Link, useNavigate }  from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useAuth }            from "../context/AuthContext.jsx";

const STRENGTH_CHECKS = [
  { label: "8+ characters",    test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Number",           test: (p) => /\d/.test(p) },
  { label: "Special character",test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };

  const score = STRENGTH_CHECKS.filter(({ test }) => test(password)).length;

  const map = [
    { label: "Too weak",  color: "bg-red-500" },    
    { label: "Weak",      color: "bg-red-400" },    
    { label: "Fair",      color: "bg-amber-400" },  
    { label: "Good",      color: "bg-brand-400" },  
    { label: "Strong",    color: "bg-green-400" },  
  ];

  return { score, ...map[score] };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password, confirmPassword }) {
  if (!email.trim())              return "Email is required.";
  if (!EMAIL_REGEX.test(email))   return "Please enter a valid email address.";
  if (!password)                  return "Password is required.";
  if (password.length < 8)        return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

export default function Signup() {
  const { signup }  = useAuth();
  const navigate    = useNavigate();

  const [formData, setFormData] = useState({
    email:           "",
    password:        "",
    confirmPassword: "",
  });

  const [error,        setError]        = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signup({
        email:    formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none fixed inset-0 overflow-hidden
          before:absolute before:top-[-20%] before:left-1/2
          before:-translate-x-1/2 before:w-[600px] before:h-[600px]
          before:rounded-full before:bg-brand-600/10 before:blur-3xl
        "
      />

      <div className="relative w-full max-w-md animate-slide-up">

        <div className="card p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="
              inline-flex items-center justify-center
              w-12 h-12 rounded-2xl bg-brand-600/20
              border border-brand-500/30 mb-4
            ">
              <CheckCircle size={22} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Create your account
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Start tracking applications and optimising with AI
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-10"
                  disabled={isSubmitting}
                />
              </div>

              {/* Strength bar — only shows once the user starts typing */}
              {formData.password && (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((segment) => (
                      <div
                        key={segment}
                        className={[
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          strength.score >= segment
                            ? strength.color
                            : "bg-slate-700",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Strength:{" "}
                    <span className="font-medium text-slate-300">
                      {strength.label}
                    </span>
                  </p>
                  {/* Requirement checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    {STRENGTH_CHECKS.map(({ label, test }) => {
                      const passed = test(formData.password);
                      return (
                        <p
                          key={label}
                          className={[
                            "text-xs flex items-center gap-1.5 transition-colors",
                            passed ? "text-green-400" : "text-slate-500",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "inline-block w-1.5 h-1.5 rounded-full",
                              passed ? "bg-green-400" : "bg-slate-600",
                            ].join(" ")}
                          />
                          {label}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={[
                    "input pl-10",
                    // Inline confirmation feedback once the user has typed in the field
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/50"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-green-500/60 focus:border-green-500 focus:ring-green-500/50"
                      : "",
                  ].join(" ")}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="
                rounded-xl border border-red-500/30 bg-red-500/10
                px-4 py-3 text-sm text-red-400
                animate-fade-in
              ">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-800 px-3 text-xs text-slate-500">
                Already have an account?
              </span>
            </div>
          </div>

          <Link to="/login" className="btn-ghost w-full">
            Sign in instead
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By creating an account you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
