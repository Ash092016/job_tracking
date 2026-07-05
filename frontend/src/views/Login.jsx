import { useState }         from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth }           from "../context/AuthContext.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  if (!email.trim())             return "Email is required.";
  if (!EMAIL_REGEX.test(email))  return "Please enter a valid email address.";
  if (!password)                 return "Password is required.";
  return null; 
}


export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [error,        setError]        = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        "Login failed. Please check your credentials and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">

      {/* Ambient glow — pure CSS, no image */}
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

        {/* Card */}
        <div className="card p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="
              inline-flex items-center justify-center
              w-12 h-12 rounded-2xl bg-brand-600/20
              border border-brand-500/30 mb-4
            ">
              <Lock size={22} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Sign in to continue tracking your applications
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email field */}
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
                  className="
                    absolute left-3.5 top-1/2 -translate-y-1/2
                    text-slate-500 pointer-events-none
                  "
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

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  Password
                </label>
                {/* Placeholder — wire up forgot-password in a future step */}
                <span className="text-xs text-brand-400 cursor-pointer hover:text-brand-300 transition-colors">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="
                    absolute left-3.5 top-1/2 -translate-y-1/2
                    text-slate-500 pointer-events-none
                  "
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="
                rounded-xl border border-red-500/30 bg-red-500/10
                px-4 py-3 text-sm text-red-400
                animate-fade-in
              ">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
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
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Link to signup */}
          <Link
            to="/signup"
            className="btn-ghost w-full"
          >
            Create an account
          </Link>
        </div>

        {/* Below-card legal note */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Protected by HTTP-only cookies. Your credentials are never stored in the browser.
        </p>
      </div>
    </div>
  );
}
