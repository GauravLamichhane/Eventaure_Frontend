// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, MapPin, Globe, ArrowRight } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function formatDate(dt) {
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { getProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout() already handles cleanup in finally — this won't fire
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        // fetch profile + my events in parallel
        const [profileData, eventsRes] = await Promise.all([
          getProfile(),
          api.get("events/", { params: { mine: "true" } }),
        ]);
        if (!mounted) return;
        setProfile(profileData);
        setEvents(eventsRes.data.results ?? eventsRes.data);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Couldn't load dashboard.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [getProfile]);

  const firstName = profile?.first_name || "there";

  // derived stats
  const published = events.filter((e) => e.is_published).length;
  const drafts = events.filter((e) => !e.is_published).length;
  const totalCap = events.reduce((s, e) => s + (e.capacity ?? 0), 0);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#ebebeb] rounded-xl p-5 animate-pulse h-24"
            />
          ))}
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 animate-pulse h-64" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <p className="text-sm text-[#8f8f8f] mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-[#171717] underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">
            Hi, {firstName}
          </h1>
          <p className="text-sm text-[#8f8f8f] mt-0.5">
            Here's what's happening with your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/events/new"
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#171717] rounded-md px-3 h-9 no-underline hover:bg-[#333] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create event
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-[#4d4d4d] bg-white border border-[#ebebeb] rounded-md px-3 h-9 cursor-pointer hover:bg-[#fafafa] transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total events", value: events.length, sub: "All time" },
          { label: "Published", value: published, sub: "Live now" },
          { label: "Drafts", value: drafts, sub: "Not live" },
          {
            label: "Total capacity",
            value: totalCap,
            sub: "Across all events",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white border border-[#ebebeb] rounded-xl p-5"
          >
            <p className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono mb-2">
              {label}
            </p>
            <p className="text-3xl font-semibold text-[#171717] tracking-tight leading-none">
              {value}
            </p>
            <p className="text-xs text-[#8f8f8f] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Events table */}
      <div className="bg-white border border-[#ebebeb] rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f2f2f2]">
          <p className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono">
            Your events
          </p>
          <Link
            to="/events"
            className="flex items-center gap-1 text-xs font-medium text-body no-underline hover:text-ink transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 px-5">
            <p className="text-sm font-medium text-[#4d4d4d] mb-1">
              No events yet
            </p>
            <p className="text-sm text-[#8f8f8f] mb-4">
              Create your first event to get started.
            </p>
            <Link
              to="/events/new"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#171717] rounded-full px-4 h-9 no-underline hover:bg-[#333] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create event
            </Link>
          </div>
        ) : (
          <div>
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-5 py-3.5 border-b border-[#f2f2f2] last:border-0"
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-[#f2f2f2] rounded-lg flex items-center justify-center shrink-0">
                    {event.event_type === "online" ? (
                      <Globe className="w-4 h-4 text-[#8f8f8f]" />
                    ) : (
                      <MapPin className="w-4 h-4 text-[#8f8f8f]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#171717] truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-[#8f8f8f] mt-0.5 truncate">
                      {formatDate(event.start_datetime)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right: badge + capacity + action */}
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {event.is_published ? (
                    <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Published
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Draft
                    </span>
                  )}
                  <span className="text-xs text-[#8f8f8f] hidden sm:block">
                    {event.capacity} seats
                  </span>
                  <button
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="text-xs font-medium text-[#4d4d4d] bg-white border border-[#ebebeb] rounded-md px-3 h-7 cursor-pointer hover:bg-[#fafafa] transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
