import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Hardcoded fallbacks for things backend doesn't serve
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=640&q=80";

function formatTime(datetimeStr) {
  return new Date(datetimeStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateChip(datetimeStr) {
  const date = new Date(datetimeStr);
  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
  };
}

function EventCard({ event }) {
  const navigate = useNavigate();
  const { month, day } = formatDateChip(event.start_datetime);
  const startTime = formatTime(event.start_datetime);
  const endTime = formatTime(event.end_datetime);

  return (
    <div className="w-80 bg-white border border-gray-100 rounded-2xl overflow-hidden mb-2">
      {/* Image */}
      <div className="relative h-44">
        <img
          src={event.image ?? FALLBACK_IMAGE}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-black text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider font-mono">
          {event.event_type} {/* ← from backend */}
        </span>
        <div className="absolute top-3 right-3 bg-white/90 border border-gray-200 rounded-lg px-2.5 py-1.5 text-center">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            {month}
          </div>
          <div className="text-xl font-semibold text-gray-900 leading-tight">
            {day}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight leading-snug mb-1">
          {event.title} {/* ← from backend */}
        </h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          {event.description} {/* ← from backend */}
        </p>

        <div className="flex flex-col gap-1.5 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{event.location}</span> {/* ← from backend */}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {startTime} – {endTime}
            </span>{" "}
            {/* ← from backend, formatted */}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>
              {event.capacity} seats · {event.waitlist_capacity} waitlist
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
          {event.is_published ? (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Published
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Draft
            </span>
          )}
          <button
            className="bg-black text-white text-sm font-medium px-4 h-8 rounded-full flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
