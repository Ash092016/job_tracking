import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  {
    to:    "/dashboard",
    label: "Dashboard",
    Icon:  LayoutDashboard,
  },
  {
    to:    "/profile",
    label: "Profile",
    Icon:  UserCheck,
  },
  {
    to:    "/jobs",
    label: "Applications",
    Icon:  Briefcase,
  },
];

const navLinkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-xl px-3 py-2.5",
    "text-sm font-medium transition-all duration-150",
    "group",
    isActive
      ? "bg-brand-600/20 text-brand-400 shadow-[inset_2px_0_0_0] shadow-brand-500"
      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
  ].join(" ");


export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName  = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email ?? "User";
  const displayEmail = user?.email ?? "";
  const initials     = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="
        flex flex-col
        w-16 md:w-64
        bg-slate-900
        border-r border-slate-800
        transition-all duration-200
        shrink-0
      ">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
          <div className="
            flex items-center justify-center
            w-8 h-8 rounded-lg
            bg-brand-600
            shrink-0
          ">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="hidden md:block text-sm font-semibold text-slate-100 tracking-tight">
            JobTracker <span className="text-brand-400">AI</span>
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {/* Icon — always visible */}
              <Icon
                size={18}
                className="shrink-0 group-hover:scale-105 transition-transform duration-150"
              />
              {/* Label — hidden on mobile, visible md+ */}
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User block + logout */}
        <div className="border-t border-slate-800 px-2 py-3 space-y-1">

          {/* User identity card */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl">
            {/* Avatar */}
            <div className="
              flex items-center justify-center
              w-8 h-8 rounded-full shrink-0
              bg-brand-700 text-brand-200
              text-xs font-semibold
            ">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Mobile avatar */}
          <div className="md:hidden flex justify-center px-2 py-1">
            <div className="
              flex items-center justify-center
              w-8 h-8 rounded-full
              bg-brand-700 text-brand-200
              text-xs font-semibold
            ">
              {initials}
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3 rounded-xl px-3 py-2.5
              text-sm font-medium text-slate-400
              transition-all duration-150
              hover:bg-red-500/10 hover:text-red-400
              active:scale-[0.98]
            "
          >
            <LogOut size={18} className="shrink-0" />
            <span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar — page title injected via React Router's
            location or a context in future steps */}
        <header className="
          flex items-center justify-between
          px-6 py-4
          border-b border-slate-800
          bg-slate-950/80 backdrop-blur-sm
          shrink-0
        ">
          <div>
            <h1 className="text-base font-semibold text-slate-100">
              Welcome back{user?.profile?.firstName ? `, ${user.profile.firstName}` : ""}.
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track your applications and optimise with AI.
            </p>
          </div>

          {/* Slot for action buttons injected by child pages
              (e.g. "Add Application" on the Jobs view).
              Steps 5 & 6 will populate this via a HeaderContext. */}
          <div id="header-actions" />
        </header>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* React Router renders the matched child route here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
