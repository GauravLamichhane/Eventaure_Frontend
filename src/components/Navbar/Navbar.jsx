// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Plus, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between h-13 px-6 bg-[#fafafa] border-b border-[#ebebeb]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-7 h-7 bg-[#171717] rounded-md flex items-center justify-center shrink-0">
          <span className="text-white text-[13px] font-semibold font-mono">
            E
          </span>
        </div>
        <span className="text-[15px] font-semibold text-[#171717] tracking-tight">
          eventaure
        </span>
      </Link>

      {/* Nav links */}
      {user ? (
        <div className="flex items-center gap-0.5">
          {[
            { to: "/events", label: "Events" },
            { to: "/registrations", label: "My registrations" },
            { to: "/dashboard", label: "Dashboard" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-full transition-colors no-underline
                 ${
                   isActive
                     ? "text-[#171717] font-medium"
                     : "text-[#4d4d4d] hover:bg-[#f2f2f2]"
                 }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-0.5">
          {[
            { to: "/events", label: "Browse" },
            { to: "/pricing", label: "Pricing" },
            { to: "/organizers", label: "For organizers" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-full transition-colors no-underline
                 ${
                   isActive
                     ? "text-[#171717] font-medium"
                     : "text-[#4d4d4d] hover:bg-[#f2f2f2]"
                 }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Right side */}
      {user ? (
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button className="relative w-8 h-8 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-[#4d4d4d]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-[#fafafa]" />
          </button>

          {/* Create event */}
          <button
            onClick={() => navigate("/events/new")}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#171717] border-none rounded-md px-3 h-8 cursor-pointer hover:bg-[#333] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create event
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-7 h-7 rounded-full bg-[#171717] flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer border-none"
            title="Log out"
          >
            {user.email?.slice(0, 2).toUpperCase() ?? "U"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium text-[#171717] bg-white border border-[#ebebeb] rounded-md px-3 h-8 flex items-center no-underline hover:bg-[#f2f2f2] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium text-white bg-[#171717] rounded-md px-3 h-8 flex items-center no-underline hover:bg-[#333] transition-colors"
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
