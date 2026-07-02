// src/pages/EventDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  User,
  Ticket,
  Pencil,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

function normalizeId(value) {
  if (value === null || value === undefined) return null;
  return String(value);
}

export default function EventDetailPage() {
  const { getProfile, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get(`events/${id}/`);
        setEvent(eventRes.data);

        if (user) {
          try {
            const profileData = await getProfile();
            setProfile(profileData);
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.log(err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getProfile, user]);

  const isLoggedIn = Boolean(user);
  const profileId = normalizeId(
    profile?.id ?? profile?.user?.id ?? profile?.user_id,
  );
  const organizerId = normalizeId(
    event?.organizer_id ?? event?.organizer?.id ?? event?.organizer,
  );
  const isOrganizer = Boolean(
    profileId && organizerId && profileId === organizerId,
  );
  // console.log(event.value);

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
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors cursor-pointer"
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
      <div className="border border-[#ebebeb] rounded-2xl p-5">
        {isOrganizer ? (
          // Organizer view
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#8f8f8f] text-center mb-1">
              You're the organizer of this event
            </p>
            <button
              onClick={() => navigate(`/events/${event.id}/edit`)}
              className="w-full bg-[#171717] text-white rounded-full h-11 text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit event
            </button>
            <button
              onClick={() => navigate(`/dashboard`)}
              className="w-full border border-[#ebebeb] rounded-full h-11 text-[15px] font-medium text-[#4d4d4d] hover:bg-[#fafafa] transition-colors"
            >
              View in dashboard
            </button>
          </div>
        ) : isLoggedIn ? (
          // Attendee view
          <>
            <button className="w-full bg-black text-white rounded-full h-11 text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
              <Ticket className="w-4 h-4" /> Register for this event
            </button>
            <button className="w-full mt-3 border border-[#ebebeb] rounded-full h-11 text-[15px] font-medium text-[#4d4d4d] hover:bg-[#fafafa] transition-colors">
              Join waitlist
            </button>
          </>
        ) : (
          // Guest view
          <div className="text-center">
            <p className="text-sm text-[#8f8f8f] mb-3">
              Sign in to register for this event or join the waitlist.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#171717] text-white rounded-full h-11 text-[15px] font-medium hover:bg-[#333] transition-colors"
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
