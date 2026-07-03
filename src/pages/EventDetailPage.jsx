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
  Link,
  Video,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

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

function getMeetingHref(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function EventDetailPage() {
  const { getProfile, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.title = "Event Details | Eventaure";
      return;
    }

    if (!event) {
      document.title = "Event Not Found | Eventaure";
      return;
    }

    document.title = `${event.title} | Eventaure`;
  }, [event, loading]);

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
            // console.log(profileData);
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
  // console.log(isLoggedIn);

  const isOrganizer = profile?.id === event?.organizer;
  // console.log(profile?.id);
  // console.log(event?.organizer);
  // console.log(isOrganizer);

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
  // console.log(event);

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
      {/* <div>
        {event.event_type == "Online" ? (
          <h1>Meeting URL is required</h1>
        ) : (
          <h1>Not Required</h1>
        )}
      </div> */}

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

        <div>
          {(event.event_type === "physical" ||
            event.event_type === "hybrid") && (
            <div
              key="Location"
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
              <span className="text-xs text-gray-400 w-20 shrink-0">
                Location
              </span>
              <span className="text-sm font-medium text-gray-800">
                {event.location}
              </span>
            </div>
          )}

          {(event.event_type === "online" || event.event_type === "hybrid") && (
            <div>
              <div
                key="url"
                className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
              >
                <Link className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-xs text-gray-400 w-20 shrink-0">URL</span>
                {event.meeting_url ? (
                  <a
                    href={getMeetingHref(event.meeting_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline break-all"
                  >
                    {event.meeting_url}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-800">N/A</span>
                )}
              </div>
              <div
                key="Meeting Platform"
                className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
              >
                <Video className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-xs text-gray-400 w-20 shrink-0">
                  Platform
                </span>
                <a className="text-sm font-medium text-gray-800">
                  {event.meeting_platform}
                </a>
              </div>
            </div>
          )}
        </div>
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
      <div className="border border-hairline rounded-2xl p-5">
        {isOrganizer ? (
          // Organizer view
          <div className="flex flex-col gap-2 items-center">
            <p className="text-xs text-mute text-center mb-1">
              You're the organizer of this event
            </p>
            <button
              onClick={() => navigate(`/events/${event.id}/edit`)}
              className="w-full sm:w-auto sm:min-w-[220px] bg-[#171717] text-white rounded-full h-11 px-6 text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" /> Edit event
            </button>
            <button
              onClick={() => navigate(`/dashboard`)}
              className="w-full sm:w-auto sm:min-w-[220px] border border-[#ebebeb] rounded-full h-11 px-6 text-[15px] font-medium text-[#4d4d4d] hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              View in dashboard
            </button>
          </div>
        ) : isLoggedIn ? (
          // Attendee view
          <div className="flex flex-col items-center">
            <button className="w-full sm:w-auto sm:min-w-[220px] bg-black text-white rounded-full h-11 px-6 text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer">
              <Ticket className="w-4 h-4" /> Register for this event
            </button>
            <button className="w-full sm:w-auto sm:min-w-[220px] mt-3 border border-[#ebebeb] rounded-full h-11 px-6 text-[15px] font-medium text-[#4d4d4d] hover:bg-[#fafafa] transition-colors cursor-pointer">
              Join waitlist
            </button>
          </div>
        ) : (
          // Guest view
          <div className="text-center flex flex-col items-center">
            <p className="text-sm text-[#8f8f8f] mb-3">
              Sign in to register for this event or join the waitlist.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto sm:min-w-[220px] bg-[#171717] text-white rounded-full h-11 px-6 text-[15px] font-medium hover:bg-[#333] transition-colors"
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
