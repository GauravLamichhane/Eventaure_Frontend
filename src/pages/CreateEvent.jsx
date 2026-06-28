import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    capacity: "",
    is_published: true,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Event title is required.");
      return;
    }

    if (!form.start_datetime) {
      setError("Start date and time is required.");
      return;
    }

    if (!form.end_datetime) {
      setError("End date and time is required.");
      return;
    }

    if (new Date(form.end_datetime) <= new Date(form.start_datetime)) {
      setError("End date and time must be after the start date and time.");
      return;
    }

    if (!form.capacity || Number(form.capacity) <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      start_datetime: new Date(form.start_datetime).toISOString(),
      end_datetime: new Date(form.end_datetime).toISOString(),
      capacity: Number(form.capacity),
      is_published: form.is_published,
    };

    try {
      setIsSubmitting(true);
      setError("");
      await api.post("http://localhost:8000/api/events/", payload);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data && typeof err.response.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : null) ||
        "Could not create event.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[rgb(37,41,41)] mb-2">
          Create Event
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the details for your new event.
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            placeholder="Event title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <textarea
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            rows="5"
            placeholder="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            placeholder="Location"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            type="datetime-local"
            value={form.start_datetime}
            onChange={(e) => handleChange("start_datetime", e.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            type="datetime-local"
            value={form.end_datetime}
            onChange={(e) => handleChange("end_datetime", e.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => handleChange("is_published", e.target.checked)}
            />
            Publish event immediately
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="border bg-[rgb(37,41,41)] text-white px-4 py-2 rounded hover:bg-white hover:text-[rgb(37,41,41)] hover:border disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
