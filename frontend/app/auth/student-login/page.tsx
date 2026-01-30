"use client";

// Imports React state, Next.js navigation, and UI icons for the page
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, GraduationCap } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: "",
    department: "",
    yearLevel: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Static list of department codes and names used for selection or display
  const departments = [
    { code: "SE", name: "Software Engineering" },
    { code: "CS", name: "Computer Science" },
    { code: "IT", name: "Information Technology" },
    { code: "CE", name: "Computer Engineering" },
  ];

  // List of academic year levels with display labels for forms or dropdowns
  const yearLevels = [
    { value: "1", label: "Year 1 (First Year)" },
    { value: "2", label: "Year 2 (Second Year)" },
    { value: "3", label: "Year 3 (Third Year)" },
    { value: "4", label: "Year 4 (Fourth Year)" },
  ];

  const validateStudentId = (id: string) => {
    // Format: ugr/0303/25
    const pattern = /^ugr\/\d{4}\/\d{2}$/i;
    return pattern.test(id);
  };

  // Calculates a student's current year (1-4) based on the last segment of their ID
  const calculateYearFromId = (studentId: string) => {
    // Extract year from ID (last 2 digits)
    const parts = studentId.split("/");
    if (parts.length === 3) {
      const batchYear = parseInt("20" + parts[2]); // 25 -> 2025
      const currentYear = new Date().getFullYear();
      const yearsSinceBatch = currentYear - batchYear;
      return Math.min(Math.max(yearsSinceBatch + 1, 1), 4); // Between 1-4
    }
    return null;
  };

  // Validates input and logs in student by storing info locally, then redirects to dashboard
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate student ID
    if (!validateStudentId(formData.studentId)) {
      setErrors({ studentId: "Invalid ID format. Use: ugr/0303/25" });
      return;
    }

    // Validate department
    if (!formData.department) {
      setErrors({ department: "Please select your department" });
      return;
    }

    // Validate year level
    if (!formData.yearLevel) {
      setErrors({ yearLevel: "Please select your year level" });
      return;
    }

    setIsLoading(true);

    try {
      // Store student info in localStorage for now
      // Later this will be replaced with proper API authentication
      const studentData = {
        studentId: formData.studentId,
        department: formData.department,
        yearLevel: formData.yearLevel,
        role: "student",
      };

      localStorage.setItem("studentAuth", JSON.stringify(studentData));

      // Redirect to student dashboard
      router.push("/student");
    } catch (error) {
      setErrors({ submit: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-suggest year level based on ID
  const handleStudentIdChange = (id: string) => {
    setFormData({ ...formData, studentId: id });

    if (validateStudentId(id)) {
      const suggestedYear = calculateYearFromId(id);
      if (suggestedYear) {
        setFormData((prev) => ({
          ...prev,
          studentId: id,
          yearLevel: suggestedYear.toString(),
        }));
      }
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
            href="/auth/login"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Staff Login
          </Link>
        </div>
      </div>

      {/* Login form - centered, grid-based */}
      <div className="pt-32 pb-20 px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 bg-black flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
              Student Portal
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Student Access
            </h1>
            <p className="text-gray-600">
              Enter your student ID to view your schedule
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Student ID */}
            <div className="space-y-6">
              <div className="text-sm font-medium text-black uppercase tracking-wide">
                01. Student Identification
              </div>

              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Student ID
                </label>
                <input
                  id="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  className={`w-full px-4 py-4 border text-lg font-mono ${
                    errors.studentId
                      ? "border-black bg-gray-50"
                      : "border-gray-300"
                  } text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors`}
                  placeholder="ugr/0303/25"
                  required
                  autoFocus
                />
                {errors.studentId && (
                  <p className="mt-2 text-xs text-black">{errors.studentId}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Format: ugr/[student-number]/[year] (e.g., ugr/0303/25)
                </p>
              </div>
            </div>

            {/* Department & Year */}
            <div className="space-y-6">
              <div className="text-sm font-medium text-black uppercase tracking-wide">
                02. Academic Information
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className={`w-full px-4 py-4 border ${
                      errors.department
                        ? "border-black bg-gray-50"
                        : "border-gray-300"
                    } text-black focus:outline-none focus:border-black transition-colors`}
                    required
                  >
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept.code} value={dept.code}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-xs text-black">
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Year Level */}
                <div>
                  <label
                    htmlFor="yearLevel"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Year Level
                  </label>
                  <select
                    id="yearLevel"
                    value={formData.yearLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, yearLevel: e.target.value })
                    }
                    className={`w-full px-4 py-4 border ${
                      errors.yearLevel
                        ? "border-black bg-gray-50"
                        : "border-gray-300"
                    } text-black focus:outline-none focus:border-black transition-colors`}
                    required
                  >
                    <option value="">Select year...</option>
                    {yearLevels.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  {errors.yearLevel && (
                    <p className="mt-2 text-xs text-black">
                      {errors.yearLevel}
                    </p>
                  )}
                </div>
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
                  Accessing Schedule...
                </>
              ) : (
                "View My Schedule"
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-12 border border-gray-200 p-6">
            <div className="text-sm font-medium text-black mb-3">
              How to access your schedule:
            </div>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="text-black font-medium">1.</span>
                <span>Enter your complete student ID (e.g., ugr/0303/25)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-black font-medium">2.</span>
                <span>Select your department from the dropdown</span>
              </li>
              <li className="flex gap-3">
                <span className="text-black font-medium">3.</span>
                <span>Confirm your current year level</span>
              </li>
              <li className="flex gap-3">
                <span className="text-black font-medium">4.</span>
                <span>View your complete schedule with rooms and floors</span>
              </li>
            </ol>
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
