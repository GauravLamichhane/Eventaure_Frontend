import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    try {
      setError("");
      const nextErrors = {};
      if (!form.first_name.trim())
        nextErrors.first_name = "First name is required";
      if (!form.last_name.trim())
        nextErrors.last_name = "Last name is required";

      if (!form.email.trim()) {
        nextErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Enter a valid email address";
      }

      if (!form.password) {
        nextErrors.password = "Password is required";
      } else if (form.password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters";
      }

      if (!form.confirm_password) {
        nextErrors.confirm_password = "Confirm your password";
      } else if (form.password !== form.confirm_password) {
        nextErrors.confirm_password = "Passwords do not match";
      }

      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

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
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const serverFieldErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          if (key === "detail" || key === "message") return;
          serverFieldErrors[key] = Array.isArray(value)
            ? value.join(" ")
            : String(value);
        });
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        }
      }
      const message =
        data?.detail ||
        data?.message ||
        (data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : null) ||
        "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-[19px] w-150 mb-5">Sign up to Eventaure</h1>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <input
          className={`w-full py-4.5 px-3.25 border rounded h-12.5 mb-1 text-[15px] focus:text-[#252929] focus:outline-none ${
            fieldErrors.first_name
              ? "border-red-400 focus:border-red-500"
              : "border-[rgb(233,234,234)] focus:border-black"
          }`}
          placeholder="First Name"
          onChange={(e) => handleChange("first_name", e.target.value)}
        />
        {fieldErrors.first_name && (
          <p className="text-red-600 mb-4 text-sm">{fieldErrors.first_name}</p>
        )}
        <input
          className={`w-full py-4.5 px-3.25 border rounded h-12.5 mb-1 text-[15px] focus:text-[#252929] focus:outline-none ${
            fieldErrors.last_name
              ? "border-red-400 focus:border-red-500"
              : "border-[rgb(233,234,234)] focus:border-black"
          }`}
          placeholder="Last Name"
          onChange={(e) => handleChange("last_name", e.target.value)}
        />
        {fieldErrors.last_name && (
          <p className="text-red-600 mb-4 text-sm">{fieldErrors.last_name}</p>
        )}
        <input
          className={`w-full py-4.5 px-3.25 border rounded h-12.5 mb-1 text-[15px] focus:text-[#252929] focus:outline-none ${
            fieldErrors.email
              ? "border-red-400 focus:border-red-500"
              : "border-[rgb(233,234,234)] focus:border-black"
          }`}
          placeholder="Email"
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {fieldErrors.email && (
          <p className="text-red-600 mb-4 text-sm">{fieldErrors.email}</p>
        )}
        <div className="relative mb-5">
          <input
            className={`w-full py-4.5 px-3.25 border rounded h-12.5 text-[15px] focus:text-[#252929] focus:outline-none ${
              fieldErrors.password
                ? "border-red-400 focus:border-red-500"
                : "border-[rgb(233,234,234)] focus:border-black"
            }`}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => handleChange("password", e.target.value)}
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
          <p className="text-red-600 -mt-3 mb-4 text-sm">
            {fieldErrors.password}
          </p>
        )}
        <div className="relative mb-5">
          <input
            className={`w-full py-4.5 px-3.25 border rounded h-12.5 text-[15px] focus:text-[#252929] focus:outline-none ${
              fieldErrors.confirm_password
                ? "border-red-400 focus:border-red-500"
                : "border-[rgb(233,234,234)] focus:border-black"
            }`}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => handleChange("confirm_password", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {fieldErrors.confirm_password && (
          <p className="text-red-600 -mt-3 mb-4 text-sm">
            {fieldErrors.confirm_password}
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="border w-full bg-[rgb(37,41,41)] text-white p-2 rounded hover:bg-white cursor-pointer hover:text-[rgb(37,41,41)] hover:border mb-5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <a href="/login" className="text-[rgb(0,136,206)] hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
