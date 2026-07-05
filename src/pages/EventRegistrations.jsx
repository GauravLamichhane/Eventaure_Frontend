import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import api from "../api/axios";

const STATUS_STYLES = {
  registered: "bg-emerald-100 text-emerald-800",
  waitlisted: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function EventRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("registrations/")
      .then((res) => setRegistrations(res.data.results ?? res.data))
      .catch(() => setError("Couldn't load registrations."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="max-w-xl mx-auto py-10 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#ebebeb] rounded-xl h-16 animate-pulse"
          />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <p className="text-sm text-[#8f8f8f]">{error}</p>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono mb-1">
        My registrations
      </p>
      <h1 className="text-2xl font-semibold text-[#171717] tracking-tight mb-6">
        Your registered events
      </h1>

      {registrations.length === 0 ? (
        <div className="bg-white border border-[#ebebeb] rounded-xl py-16 text-center">
          <CalendarDays className="w-8 h-8 text-[#d4d4d4] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#4d4d4d] mb-1">
            No registrations yet
          </p>
          <p className="text-sm text-[#8f8f8f] mb-4">
            Browse events and register for one.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="text-sm font-medium text-white bg-[#171717] rounded-full px-4 h-9 border-none cursor-pointer hover:bg-[#333] transition-colors"
          >
            Browse events
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          {/* header */}
          <div className="px-5 py-3.5 border-b border-[#f2f2f2]">
            <span className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono">
              {registrations.length}{" "}
              {registrations.length === 1 ? "registration" : "registrations"}
            </span>
          </div>

          {/* rows */}
          <div className="divide-y divide-[#f2f2f2]">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#fafafa] transition-colors cursor-pointer"
                onClick={() => navigate(`/events/${reg.event}`)}
              >
                {/* left */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-[#f2f2f2] rounded-lg flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-[#8f8f8f]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#171717] truncate">
                      {reg.event_title}
                    </p>
                    <p className="text-xs text-[#8f8f8f] mt-0.5 truncate">
                      {reg.attendee_email}
                    </p>
                  </div>
                </div>

                {/* status badge */}
                <span
                  className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ml-4 capitalize ${STATUS_STYLES[reg.status] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
