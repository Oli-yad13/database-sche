"use client";
// Imports React state, Next.js Link, authentication context, and UI icons for login/reset forms
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Check, Eye, EyeOff } from "lucide-react";

// Handles user registration state and validates inputs for username, email, password, and role
export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "admin" | "teacher" | "student",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.username.length < 3) {
      newErrors.username = "Minimum 3 characters required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Requires: uppercase, lowercase, number, special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submits the registration form after validation, handling API errors and loading state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicators
  const hasMinLength = formData.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[@$!%*?&]/.test(formData.password);

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-black"
          >
            UNISCHEDULE
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Register form */}
      <div className="pt-32 pb-20 px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
              New Account
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join the university scheduling system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="text-sm font-medium text-black uppercase tracking-wide">
                01. Basic Information
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.username
                        ? "border-black bg-gray-50"
                        : "border-gray-300"
                    } text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors`}
                    placeholder="johndoe"
                    required
                    autoFocus
                  />
                  {errors.username && (
                    <p className="mt-2 text-xs text-black">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.email
                        ? "border-black bg-gray-50"
                        : "border-gray-300"
                    } text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors`}
                    placeholder="john@university.edu"
                    required
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-black">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-6">
              <div className="text-sm font-medium text-black uppercase tracking-wide">
                02. Account Type
              </div>

              <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  className={`p-6 text-center transition-colors ${
                    formData.role === "student"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">Student</div>
                  <div className="text-xs opacity-60">Course enrollment</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "teacher" })}
                  className={`p-6 text-center transition-colors ${
                    formData.role === "teacher"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">Teacher</div>
                  <div className="text-xs opacity-60">Course management</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "admin" })}
                  className={`p-6 text-center transition-colors ${
                    formData.role === "admin"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">Admin</div>
                  <div className="text-xs opacity-60">System control</div>
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-6">
              <div className="text-sm font-medium text-black uppercase tracking-wide">
                03. Security
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full px-4 py-3 pr-12 border ${
                        errors.password
                          ? "border-black bg-gray-50"
                          : "border-gray-300"
                      } text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-black transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-xs text-black">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 pr-12 border ${
                        errors.confirmPassword
                          ? "border-black bg-gray-50"
                          : "border-gray-300"
                      } text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-black transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs text-black">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="border border-gray-200 p-4 space-y-2">
                  <div className="text-xs font-medium text-black mb-3">
                    Password Requirements:
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div
                      className={`flex items-center gap-2 ${hasMinLength ? "text-black" : "text-gray-400"}`}
                    >
                      <Check className="h-3 w-3" />
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${hasUpperCase ? "text-black" : "text-gray-400"}`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Uppercase</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${hasLowerCase ? "text-black" : "text-gray-400"}`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Lowercase</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${hasNumber ? "text-black" : "text-gray-400"}`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Number</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${hasSpecial ? "text-black" : "text-gray-400"}`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Special char</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="border border-black bg-gray-50 px-4 py-3">
                <p className="text-sm text-black">{errors.submit}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-black font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-6 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto flex justify-between items-center text-xs text-gray-400">
          <span>© 2026 UniSchedule</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-black transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
