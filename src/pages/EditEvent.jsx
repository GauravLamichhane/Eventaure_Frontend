import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import EventForm from "../components/EventForm";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`events/${id}/`);
        setEvent(res.data);
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Could not load event.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">Loading event...</div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <p className="text-sm text-red-600 mb-4">
          {error || "Event not found."}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-ink underline underline-offset-2"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <EventForm
      mode="edit"
      eventId={id}
      initialData={event}
      onSuccess={() => navigate(`/events/${id}`)}
    />
  );
}
