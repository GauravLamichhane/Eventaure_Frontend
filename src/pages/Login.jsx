import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { IoEye, IoEyeOff } from "react-icons/io5";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className=" w-full max-w-md">
        <h1 className="text-[19px] w-150 mb-5">Log in to Eventaure</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          className="w-full py-4.5 px-3.25 border border-[rgb(233,234,234)] rounded h-12.5 mb-5 text-[15px] focus:border-black focus:text-[#252929] focus:outline-none"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {fieldErrors.email && (
          <p className="text-red-500 -mt-3 mb-4 text-sm">{fieldErrors.email}</p>
        )}
        <div className="relative">
          <input
            className="w-full py-4.5 px-3.25 border border-[rgb(233,234,234)] rounded h-12.5 text-[15px] focus:border-black focus:text-[#252929] focus:outline-none"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-red-500 mt-2 mb-4 text-sm">
            {fieldErrors.password}
          </p>
        )}
        <a
          href="#"
          className="block text-right my-5 text-[rgb(0,136,206)] hover:underline"
        >
          Forgot Password?
        </a>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="border w-full bg-[rgb(37,41,41)] text-white p-2 rounded hover:bg-white cursor-pointer hover:text-[rgb(37,41,41)] hover:border mb-5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Continue with Email"}
        </button>
        <p>
          By signing up and logging in you agree to our{" "}
          <a href="#" className="text-[rgb(0,136,206)] hover:underline">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="#" className="text-[rgb(0,136,206)] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p className="mt-4 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-[rgb(0,136,206)] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
