import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ImageIcon } from "lucide-react";
import api from "../api/axios";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LABELS = "JPG, PNG or WebP";

export default function CreateEvent() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    capacity: "",
    is_published: true,
  });
  const [image, setImage] = useState(null); // File object
  const [preview, setPreview] = useState(null); // Object URL for preview
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleImageChange = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Only ${ALLOWED_LABELS} images are allowed.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    if (error) setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageChange(file);
  };

  const removeImage = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Event title is required");
      return;
    }

    if (form.title.trim().length < 5) {
      setError("Event title must be at least 5 characters.");
      return;
    }
    if (!form.start_datetime)
      return setError("Start date and time is required.");
    if (!form.end_datetime) return setError("End date and time is required.");
    if (new Date(form.end_datetime) <= new Date(form.start_datetime))
      return setError("End time must be after start time.");
    if (!form.capacity || Number(form.capacity) <= 0)
      return setError("Capacity must be a positive number.");

    // Use FormData so the image file is sent as multipart
    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("location", form.location.trim());
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
      await api.post("events/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-[#171717] tracking-tight mb-1">
        Create event
      </h1>
      <p className="text-sm text-[#8f8f8f] mb-6">
        Fill in the details for your new event.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <div>
          <label className="block text-xs font-medium text-[#4d4d4d] mb-1.5">
            Event image{" "}
            <span className="text-[#a1a1a1] font-normal">(optional)</span>
          </label>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#ebebeb]">
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
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[11px] px-2 py-0.5 rounded-full">
                {(image.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-[#d4d4d4] hover:border-[#a1a1a1] rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#fafafa] hover:bg-white"
            >
              <div className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-[#8f8f8f]" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[#4d4d4d]">
                  <span className="font-medium text-[#171717]">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-[#a1a1a1] mt-0.5">
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
        </div>

        {/* Text fields */}
        {[
          { field: "title", placeholder: "Event title", type: "text" },
          { field: "location", placeholder: "Location", type: "text" },
        ].map(({ field, placeholder, type }) => (
          <input
            key={field}
            type={type}
            placeholder={placeholder}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full h-10 rounded-lg border border-[#ebebeb] px-3 text-sm text-[#171717] placeholder:text-[#a1a1a1] bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
          />
        ))}

        <textarea
          rows={4}
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-lg border border-[#ebebeb] px-3 py-2.5 text-sm text-[#171717] placeholder:text-[#a1a1a1] bg-white focus:outline-none focus:ring-1 focus:ring-black/20 resize-none"
        />

        {/* Date/time row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#4d4d4d] mb-1">
              Start
            </label>
            <input
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => handleChange("start_datetime", e.target.value)}
              className="w-full h-10 rounded-lg border border-[#ebebeb] px-3 text-sm text-[#171717] bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4d4d4d] mb-1">
              End
            </label>
            <input
              type="datetime-local"
              value={form.end_datetime}
              onChange={(e) => handleChange("end_datetime", e.target.value)}
              className="w-full h-10 rounded-lg border border-[#ebebeb] px-3 text-sm text-[#171717] bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>
        </div>

        <input
          type="number"
          min="1"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => handleChange("capacity", e.target.value)}
          className="w-full h-10 rounded-lg border border-[#ebebeb] px-3 text-sm text-[#171717] placeholder:text-[#a1a1a1] bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
        />

        <label className="flex items-center gap-2.5 text-sm text-[#4d4d4d] cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => handleChange("is_published", e.target.checked)}
            className="w-4 h-4 rounded border-[#d4d4d4] accent-black"
          />
          Publish event immediately
        </label>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-[#171717] text-white text-sm font-medium px-4 h-9 rounded-lg border-none cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-3.5 h-3.5 animate-bounce" /> Saving...
              </>
            ) : (
              "Save event"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-[#4d4d4d] px-4 h-9 rounded-lg border border-[#ebebeb] bg-white cursor-pointer hover:bg-[#fafafa] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
