"use client";

// Imports React hooks, Next.js Link, authentication context, and icons for UI interactions
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

// Handles login form state, submission, error handling, and toggling password visibility
export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await login(formData);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Login form - centered, grid-based */}
      <div className="pt-32 pb-20 px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
              Authentication
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">Sign In</h1>
            <p className="text-gray-600">Access your university dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email field */}
            <div>
              <label
                htmlFor="usernameOrEmail"
                className="block text-sm font-medium text-black mb-2"
              >
                Username or Email
              </label>
              <input
                id="usernameOrEmail"
                type="text"
                value={formData.usernameOrEmail}
                onChange={(e) =>
                  setFormData({ ...formData, usernameOrEmail: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                placeholder="your.email@university.edu"
                required
                autoFocus
              />
            </div>

            {/* Password field */}
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-black transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
            <Link
              href="/auth/forgot-password"
              className="block text-sm text-gray-600 hover:text-black transition-colors"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-black font-medium hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-6 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-md mx-auto flex justify-between items-center text-xs text-gray-400">
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
