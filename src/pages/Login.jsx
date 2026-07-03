// src/pages/Login.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const nextErrors = {};

      if (!form.email.trim()) {
        nextErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Enter a valid email address";
      }

      if (!form.password) {
        nextErrors.password = "Password is required";
      }

      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setIsSubmitting(true);
      await login(form.email, form.password);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Invalid credentials";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-medium text-[#8f8f8f] uppercase tracking-widest font-mono mb-2">
          Eventaure
        </p>
        <h1 className="text-2xl font-semibold text-[#171717] tracking-tight mb-6">
          Log in to your account
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-[42px] px-3 text-sm border border-[#ebebeb] rounded-lg bg-white text-[#171717] placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#171717] transition-colors"
            />
            {fieldErrors.email && (
              <p className="text-xs text-[#ee0000] mt-1.5">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-[42px] pl-3 pr-10 text-sm border border-[#ebebeb] rounded-lg bg-white text-[#171717] placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#171717] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-[#171717] transition-colors bg-transparent border-none cursor-pointer flex"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-[#ee0000] mt-1.5">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <a
            href="#"
            className="block text-right text-[13px] text-[#0070f3] no-underline hover:underline pb-1"
          >
            Forgot password?
          </a>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[42px] bg-[#171717] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Continue with email"}
          </button>
        </form>

        <p className="text-xs text-[#8f8f8f] leading-relaxed mt-4">
          By signing up and logging in you agree to our{" "}
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
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-[#0070f3] no-underline hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
