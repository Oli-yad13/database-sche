"use client";

import { useState, useEffect } from "react";
import { BookPlus, Search, Edit2, Trash2, X } from "lucide-react";
import { coursesApi, Course, CreateCourseData } from "@/lib/api/courses";
import { departmentsApi, Department } from "@/lib/api/departments";
import toast from "react-hot-toast";

export default function CoursesManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateCourseData>({
    code: "",
    name: "",
    description: "",
    departmentId: 0,
    creditHours: 3,
    level: 100,
    hasLab: false,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to load departments");
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      // Fetch ALL courses once, then filter client-side
      const data = await coursesApi.getAll();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles course creation by validating input, submitting to the API, managing loading state, resetting the form on success, and surfacing errors via toast notifications.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await coursesApi.create(formData);
      toast.success("Course created successfully");
      setShowAddModal(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        departmentId: 0,
        creditHours: 3,
        level: 100,
        hasLab: false,
      });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
      console.error("Error creating course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletes a course with user confirmation, handles API errors (including stale 404s), shows toast feedback, and refreshes state accordingly.
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await coursesApi.delete(id);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        toast.error("Course no longer exists. Refreshing list...");
        fetchCourses();
      } else {
        toast.error(error.response?.data?.message || "Failed to delete course");
      }
      console.error("Error deleting course:", error);
    }
  };

  // Filter locally by search query AND selected department
  const filteredCourses = courses.filter((course) => {
    const matchesDepartment =
      selectedDepartment === "all" ||
      course.departmentId === parseInt(selectedDepartment);
    const matchesSearch =
      !searchQuery ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDepartment && matchesSearch;
  });

  // Renders the Courses page header with title, description, and an action button to open the “Add Course” modal.
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Course Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Courses</h1>
            <p className="text-gray-600">Manage course catalog and offerings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <BookPlus className="h-5 w-5" />
            Add Course
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. Filters
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Courses ({isLoading ? "..." : filteredCourses.length})
        </div>
        <div className="grid md:grid-cols-2 gap-1 bg-gray-200 p-1">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-8 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="h-8 w-20 bg-gray-200 rounded mb-1"></div>
                      <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-2 bg-white p-12 text-center text-gray-400">
              No courses found matching your criteria
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-8 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-black mb-1">
                      {course.code}
                    </div>
                    <div className="text-sm text-gray-600">{course.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Edit course"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.name)}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Department</span>
                    <span className="text-black font-medium">
                      {course.department?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Credit Hours</span>
                    <span className="text-black font-medium">
                      {course.creditHours}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="text-black font-medium">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lab Component</span>
                    <span
                      className={`px-3 py-1 text-xs font-medium ${
                        course.hasLab
                          ? "border border-black text-black"
                          : "border border-gray-300 text-gray-400"
                      }`}
                    >
                      {course.hasLab ? "YES" : "NO"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Course Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Add New Course
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  01. Basic Information
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors uppercase"
                      placeholder="SE301"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Data Structures"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors resize-none"
                    placeholder="Course description..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Course Details
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Department *
                    </label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departmentId: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                    >
                      <option value="">Select department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Credit Hours *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.creditHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Level *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                    >
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasLab"
                    checked={formData.hasLab}
                    onChange={(e) =>
                      setFormData({ ...formData, hasLab: e.target.checked })
                    }
                    className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="hasLab"
                    className="text-sm font-medium text-black"
                  >
                    This course has a lab component
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? "Creating..." : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
