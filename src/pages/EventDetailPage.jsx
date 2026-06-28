// src/pages/EventDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Calendar, User, Ticket } from "lucide-react";
import axios from "axios";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80";
const FALLBACK_DESCRIPTION =
  "Join us for this exciting event. More details coming soon.";

function formatDate(datetimeStr) {
  return new Date(datetimeStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(datetimeStr) {
  return new Date(datetimeStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/events/${id}/`)
      .then((res) => setEvent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!event)
    return (
      <div className="p-8 text-center text-gray-400">Event not found.</div>
    );

  // derived values
  const spotsLeft = event.capacity; // replace with (capacity - registered_count) when backend adds it
  const startTime = formatTime(event.start_datetime);
  const endTime = formatTime(event.end_datetime);
  const date = formatDate(event.start_datetime);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to events
      </button>

      {/* Hero image — hardcoded fallback */}
      <img
        src={event.image ?? FALLBACK_IMAGE}
        alt={event.title}
        className="w-full h-64 object-cover rounded-2xl"
      />

      {/* Badges */}
      <div className="flex items-center gap-2 mt-4 mb-3">
        <span className="bg-black text-white text-[11px] font-medium px-3 py-1 rounded-full uppercase tracking-widest font-mono">
          {event.event_type}
        </span>
        {event.is_published ? (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-medium px-3 py-1 rounded-full">
            Published
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full">
            Draft
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
        {event.title}
      </h1>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        {event.description}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Total seats", value: event.capacity },
          { label: "Waitlist cap", value: event.waitlist_capacity },
          { label: "Spots left", value: spotsLeft, green: true },
        ].map(({ label, value, green }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
            <div
              className={`text-2xl font-semibold tracking-tight ${green ? "text-emerald-600" : "text-gray-900"}`}
            >
              {value}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Detail card */}
      <div className="border border-gray-100 rounded-2xl p-5 mb-4">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest font-mono mb-3">
          Event details
        </p>
        {[
          { icon: Calendar, label: "Date", value: date },
          { icon: Clock, label: "Time", value: `${startTime} – ${endTime}` },
          { icon: MapPin, label: "Location", value: event.location },
          {
            icon: User,
            label: "Organizer",
            value: event.organizer_name || `Organizer #${event.organizer}`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
          >
            <Icon className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* About — hardcoded long description fallback */}
      <div className="border border-gray-100 rounded-2xl p-5 mb-4">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest font-mono mb-3">
          About this event
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          {event.long_description ?? FALLBACK_DESCRIPTION}
        </p>
      </div>

      {/* CTAs */}
      <div className="border border-gray-100 rounded-2xl p-5">
        <button className="w-full bg-black text-white rounded-full h-11 text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          <Ticket className="w-4 h-4" /> Register for this event
        </button>
        <button className="w-full mt-3 border border-gray-200 rounded-full h-11 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Join waitlist
        </button>
      </div>
    </div>
  );
}
