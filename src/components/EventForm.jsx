import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ImageIcon } from "lucide-react";
import api from "../api/axios";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LABELS = "JPG, PNG or WebP";

const EMPTY_FORM = {
  title: "",
  description: "",
  event_type: "physical",
  location: "",
  meeting_url: "",
  meeting_platform: "",
  start_datetime: "",
  end_datetime: "",
  capacity: "",
  waitlist_capacity: "",
  is_published: true,
};

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function normalizeInitialData(initialData) {
  if (!initialData) return EMPTY_FORM;

  return {
    title: initialData.title ?? "",
    description: initialData.description ?? "",
    event_type: initialData.event_type ?? "physical",
    location: initialData.location ?? "",
    meeting_url: initialData.meeting_url ?? "",
    meeting_platform: initialData.meeting_platform ?? "",
    start_datetime: toDatetimeLocal(initialData.start_datetime),
    end_datetime: toDatetimeLocal(initialData.end_datetime),
    capacity:
      initialData.capacity === null || initialData.capacity === undefined
        ? ""
        : String(initialData.capacity),
    waitlist_capacity:
      initialData.waitlist_capacity === null ||
      initialData.waitlist_capacity === undefined
        ? ""
        : String(initialData.waitlist_capacity),
    is_published: Boolean(initialData.is_published),
  };
}

export default function EventForm({
  mode = "create",
  eventId,
  initialData,
  onSuccess,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => normalizeInitialData(initialData));
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialData?.image ?? null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: "" };
    });
  };

  const handleImageChange = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        image: `Only ${ALLOWED_LABELS} images are allowed.`,
      }));
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        image: `Image must be smaller than ${MAX_SIZE_MB}MB.`,
      }));
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setFieldErrors((prev) => ({ ...prev, image: "" }));
    if (error) setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageChange(file);
  };

  const removeImage = () => {
    setImage(null);
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFieldErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Event title is required.";
    } else if (form.title.trim().length < 5) {
      nextErrors.title = "Event title must be at least 5 characters.";
    }

    if (!form.start_datetime) {
      nextErrors.start_datetime = "Start date and time is required.";
    }

    if (!form.end_datetime) {
      nextErrors.end_datetime = "End date and time is required.";
    }

    if (
      form.start_datetime &&
      form.end_datetime &&
      new Date(form.end_datetime) <= new Date(form.start_datetime)
    ) {
      nextErrors.end_datetime = "End time must be after start time.";
    }

    if (
      (form.event_type === "physical" || form.event_type === "hybrid") &&
      !form.location.trim()
    ) {
      nextErrors.location =
        "Location is required for physical or hybrid events.";
    }

    if (!form.capacity || Number(form.capacity) <= 0) {
      nextErrors.capacity = "Capacity must be a positive number.";
    }

    if (form.waitlist_capacity && Number(form.waitlist_capacity) <= 0) {
      nextErrors.waitlist_capacity =
        "Waitlist capacity must be a positive number.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("location", form.location.trim());
    payload.append("event_type", form.event_type.trim());
    payload.append("meeting_url", form.meeting_url.trim());
    payload.append("meeting_platform", form.meeting_platform.trim());
    payload.append("waitlist_capacity", form.waitlist_capacity.trim());
    payload.append(
      "start_datetime",
      new Date(form.start_datetime).toISOString(),
    );
    payload.append("end_datetime", new Date(form.end_datetime).toISOString());
    payload.append("capacity", Number(form.capacity));
    payload.append("is_published", form.is_published);
    if (image) payload.append("image", image);

    try {
      setIsSubmitting(true);
      setError("");

      if (isEdit) {
        if (!eventId) throw new Error("Missing event id for update");
        await api.patch(`events/${eventId}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("events/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data && typeof err.response.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : null) ||
        (isEdit ? "Could not update event." : "Could not create event.");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">
        {isEdit ? "Update event" : "Create event"}
      </h1>
      <p className="text-sm text-mute mb-6">
        {isEdit
          ? "Update your event details."
          : "Fill in the details for your new event."}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-body mb-1.5">
            Event image{" "}
            <span className="text-faint font-normal">(optional)</span>
          </label>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-hairline">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {image && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[11px] px-2 py-0.5 rounded-full">
                  {(image.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-[#d4d4d4] hover:border-faint rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-canvas hover:bg-white"
            >
              <div className="w-9 h-9 rounded-full bg-hairline-soft flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-mute" />
              </div>
              <div className="text-center">
                <p className="text-sm text-body">
                  <span className="font-medium text-ink">Click to upload</span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-faint mt-0.5">
                  {ALLOWED_LABELS} · max {MAX_SIZE_MB}MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleImageChange(e.target.files?.[0])}
          />
          {fieldErrors.image && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.image}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-body mb-1.5">
            Event title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. React Meetup 2026"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={`w-full h-10 rounded-lg border px-3 text-sm text-ink placeholder:text-faint bg-white focus:outline-none focus:ring-1 focus:ring-black/20 ${fieldErrors.title ? "border-red-300" : "border-hairline"}`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-body mb-1.5">
            Event type
          </label>
          <select
            value={form.event_type}
            onChange={(e) => handleChange("event_type", e.target.value)}
            className="w-full h-10 rounded-lg border border-hairline px-3"
          >
            <option value="physical">Physical</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {(form.event_type === "hybrid" || form.event_type === "physical") && (
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 123 Main St, City"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className={`w-full h-10 rounded-lg border px-3 ${fieldErrors.location ? "border-red-300" : "border-hairline"}`}
            />
            {fieldErrors.location && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.location}
              </p>
            )}
          </div>
        )}

        {(form.event_type === "online" || form.event_type === "hybrid") && (
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">
              Meeting URL
            </label>
            <input
              type="text"
              placeholder="e.g. https://meet.google.com/abc-defg-hij"
              value={form.meeting_url}
              onChange={(e) => handleChange("meeting_url", e.target.value)}
              className="w-full h-10 rounded-lg border border-hairline px-3"
            />
          </div>
        )}

        {(form.event_type === "online" || form.event_type === "hybrid") && (
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">
              Meeting platform
            </label>
            <input
              type="text"
              placeholder="e.g. Zoom, Google Meet, Teams"
              value={form.meeting_platform}
              onChange={(e) => handleChange("meeting_platform", e.target.value)}
              className="w-full h-10 rounded-lg border border-hairline px-3"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-body mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Share agenda, audience, and what attendees should expect."
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink placeholder:text-faint bg-white focus:outline-none focus:ring-1 focus:ring-black/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-body mb-1">
              Start
            </label>
            <input
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => handleChange("start_datetime", e.target.value)}
              className={`w-full h-10 rounded-lg border px-3 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-black/20 ${fieldErrors.start_datetime ? "border-red-300" : "border-hairline"}`}
            />
            {fieldErrors.start_datetime && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.start_datetime}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1">
              End
            </label>
            <input
              type="datetime-local"
              value={form.end_datetime}
              onChange={(e) => handleChange("end_datetime", e.target.value)}
              className={`w-full h-10 rounded-lg border px-3 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-black/20 ${fieldErrors.end_datetime ? "border-red-300" : "border-hairline"}`}
            />
            {fieldErrors.end_datetime && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.end_datetime}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-body mb-1.5">
            Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 100"
            value={form.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
            className={`w-full h-10 rounded-lg border px-3 text-sm text-ink placeholder:text-faint bg-white focus:outline-none focus:ring-1 focus:ring-black/20 ${fieldErrors.capacity ? "border-red-300" : "border-hairline"}`}
          />
          {fieldErrors.capacity && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.capacity}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-body mb-1.5">
            Waitlist capacity
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 20"
            value={form.waitlist_capacity}
            onChange={(e) => handleChange("waitlist_capacity", e.target.value)}
            className={`w-full h-10 rounded-lg border px-3 text-sm text-ink placeholder:text-faint bg-white focus:outline-none focus:ring-1 focus:ring-black/20 ${fieldErrors.waitlist_capacity ? "border-red-300" : "border-hairline"}`}
          />
          {fieldErrors.waitlist_capacity && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.waitlist_capacity}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => handleChange("is_published", e.target.checked)}
            className="w-4 h-4 rounded border-[#d4d4d4] accent-black"
          />
          Publish event immediately
        </label>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-ink text-white text-sm font-medium px-4 h-9 rounded-lg border-none cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-3.5 h-3.5 animate-bounce" /> Saving...
              </>
            ) : isEdit ? (
              "Update event"
            ) : (
              "Create event"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-body px-4 h-9 rounded-lg border border-hairline bg-white cursor-pointer hover:bg-canvas transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
