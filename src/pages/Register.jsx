// src/pages/Register.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState({
    password: false,
    confirm_password: false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nextErrors = {};
    if (!form.first_name.trim())
      nextErrors.first_name = "First name is required";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = "Enter a valid email address";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters";
    if (!form.confirm_password)
      nextErrors.confirm_password = "Confirm your password";
    else if (form.password !== form.confirm_password)
      nextErrors.confirm_password = "Passwords don't match";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await register(
        form.first_name,
        form.last_name,
        form.email,
        form.password,
        form.confirm_password,
      );
    } catch (err) {
      const data = err?.response?.data;
      let globalError = "Registration failed";

      if (data && typeof data === "object" && !Array.isArray(data)) {
        const serverFieldErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          if (
            key === "detail" ||
            key === "message" ||
            key === "non_field_errors"
          )
            return;

          serverFieldErrors[key] = Array.isArray(value)
            ? value.join(" ")
            : String(value);
        });

        if (Object.keys(serverFieldErrors).length > 0)
          setFieldErrors(serverFieldErrors);

        const nonFieldErrors = Array.isArray(data?.non_field_errors)
          ? data.non_field_errors.join(" ")
          : data?.non_field_errors
            ? String(data.non_field_errors)
            : "";

        globalError =
          data?.detail ||
          data?.message ||
          nonFieldErrors ||
          (Object.keys(serverFieldErrors).length === 0
            ? "Registration failed"
            : "");
      } else if (Array.isArray(data)) {
        globalError = data.join(" ");
      } else if (typeof data === "string") {
        globalError = data;
      }

      setError(globalError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (key) =>
    `w-full h-[42px] pl-3 text-sm rounded-lg border bg-white text-[#171717] placeholder:text-[#a1a1a1] focus:outline-none transition-colors
     ${fieldErrors[key] ? "border-[#ee0000] focus:border-[#ee0000]" : "border-[#ebebeb] focus:border-[#171717]"}
     ${key === "password" || key === "confirm_password" ? "pr-10" : "pr-3"}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono mb-2">
          Eventaure
        </p>
        <h1 className="text-2xl font-semibold text-[#171717] tracking-tight mb-1">
          Create your account
        </h1>
        <p className="text-sm text-[#8f8f8f] mb-6">
          Join Eventaure and start discovering events.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* First + Last name side by side */}
          <div className="grid grid-cols-2 gap-2.5">
            {["first_name", "last_name"].map((key) => (
              <div key={key}>
                <input
                  type="text"
                  placeholder={
                    key === "first_name" ? "First name" : "Last name"
                  }
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={inputClass(key)}
                />
                {fieldErrors[key] && (
                  <p className="text-xs text-[#ee0000] mt-1">
                    {fieldErrors[key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClass("email")}
            />
            {fieldErrors.email && (
              <p className="text-xs text-[#ee0000] mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password + Confirm */}
          {["password", "confirm_password"].map((key) => (
            <div key={key}>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={
                    key === "password" ? "Password" : "Confirm password"
                  }
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={inputClass(key)}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShow((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-[#171717] transition-colors bg-transparent border-none cursor-pointer flex"
                  aria-label={show[key] ? "Hide password" : "Show password"}
                >
                  {show[key] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors[key] && (
                <p className="text-xs text-[#ee0000] mt-1">
                  {fieldErrors[key]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[42px] bg-[#171717] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-[#8f8f8f] leading-relaxed mt-4">
          By creating an account you agree to our{" "}
          <a href="#" className="text-[#0070f3] no-underline hover:underline">
            terms of use
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#0070f3] no-underline hover:underline">
            privacy policy
          </a>
          .
        </p>

        <p className="text-[13px] text-[#4d4d4d] mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#0070f3] no-underline hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
