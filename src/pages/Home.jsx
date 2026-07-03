// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../api/axios";
import EventCard from "../components/EventCard/EventCard";

const FILTERS = ["All", "Physical", "Online", "Hybrid"];
const TIME_FILTERS = ["Any time", "This week", "This month"];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Any time");
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (typeFilter !== "All") params.event_type = typeFilter.toLowerCase();

        const res = await api.get("events/", { params });
        setEvents(res.data.results ?? res.data);
      } catch {
        setError("Couldn't load events. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    // debounce search
    const timer = setTimeout(loadEvents, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  // client-side time filter (swap for backend param when ready)
  const filtered = events.filter((e) => {
    if (timeFilter === "Any time") return true;
    const date = new Date(e.start_datetime);
    const now = new Date();
    if (timeFilter === "This week") {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);
      return date >= now && date <= weekEnd;
    }
    if (timeFilter === "This month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero section */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 border border-gray-200 bg-white rounded-full px-3 py-1 font-mono uppercase tracking-wider mb-3">
          Upcoming events
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2 leading-tight">
          Discover events near you
        </h1>
        <p className="text-sm text-gray-400 mb-5">
          Workshops, meetups, and conferences — all in one place.
        </p>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, topics, or organizers"
            className="w-full h-10 pl-9 pr-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-colors ${
              typeFilter === f
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {TIME_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-colors ${
              timeFilter === f
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p className="text-sm text-gray-400 mb-4">
          {filtered.length} {filtered.length === 1 ? "event" : "events"} found
        </p>
      )}

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 border border-gray-100 rounded-2xl bg-white">
          <p className="text-sm text-gray-500 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-gray-900 underline underline-offset-2"
          >
            Refresh
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 border border-gray-100 rounded-2xl bg-white">
          <p className="text-sm font-medium text-gray-700 mb-1">
            No events found
          </p>
          <p className="text-sm text-gray-400">
            Try a different search or filter.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => navigate(`/events/${event.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
