"use client";

// Imports React hooks, UI icons, API utilities and types for sections and departments, and toast notifications for feedback.
import { useState, useEffect } from "react";
import { LayoutGrid, Search, Trash2, X, Users } from "lucide-react";
import { sectionsApi, Section, CreateSectionData } from "@/lib/api/sections";
import { departmentsApi, Department } from "@/lib/api/departments";
import toast from "react-hot-toast";

// SectionsManagementPage state initialization for search, department/year filters, modals, section and department data, and loading/submitting states.
export default function SectionsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initializes section form state and triggers fetching of departments and sections on component mount.
  const [formData, setFormData] = useState<CreateSectionData>({
    name: "",
    code: "",
    departmentId: 0,
    yearLevel: 1,
    capacity: 40,
    advisor: "",
    description: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchSections();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  // Fetches sections from the API filtered by department and year level, updates state, manages loading indicator, and shows a toast on failure.
  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const departmentId =
        selectedDepartment !== "all" ? parseInt(selectedDepartment) : undefined;
      const yearLevel =
        selectedYear !== "all" ? parseInt(selectedYear) : undefined;
      const data = await sectionsApi.getAll(departmentId, yearLevel);
      setSections(data);
    } catch (error) {
      toast.error("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };
  // Handles section creation: validates required fields, submits to API, manages loading state, resets form on success, refreshes section list, an
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await sectionsApi.create(formData);
      toast.success("Section created successfully");
      setShowAddModal(false);
      setFormData({
        name: "",
        code: "",
        departmentId: 0,
        yearLevel: 1,
        capacity: 40,
        advisor: "",
        description: "",
      });
      fetchSections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create section");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Deletes a section with confirmation, shows success/error toasts, and refreshes the list; also sets up dynamic section fetching when department or year filters change and defines available year levels.
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await sectionsApi.delete(id);
      toast.success("Section deleted successfully");
      fetchSections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete section");
    }
  };

  useEffect(() => {
    fetchSections();
  }, [selectedDepartment, selectedYear]);

  const yearLevels = [1, 2, 3, 4];

  // Filters sections based on search query, selected department, and selected year level, returning only matching results.
  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      section.departmentId === parseInt(selectedDepartment);
    const matchesYear =
      selectedYear === "all" || section.yearLevel === parseInt(selectedYear);
    return matchesSearch && matchesDepartment && matchesYear;
  });

  // Determines section enrollment status based on capacity utilization: returns "full" (≥95%), "high" (≥80%), or "normal" otherwise.
  const getEnrollmentStatus = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 95) return "full";
    if (percentage >= 80) return "high";
    return "normal";
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Section Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Sections</h1>
            <p className="text-gray-600">Manage student sections and groups</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <LayoutGrid className="h-5 w-5" />
            Add Section
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. Filters
        </div>
        <div className="grid md:grid-cols-3 gap-6">
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

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Years</option>
            {yearLevels.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sections Grid */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Sections ({filteredSections.length})
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-gray-200 p-1">
          {filteredSections.length === 0 ? (
            <div className="col-span-3 bg-white p-12 text-center text-gray-400">
              No sections found matching your criteria
            </div>
          ) : (
            filteredSections.map((section) => {
              const enrolled = section._count?.enrollments || 0;
              const enrollmentStatus = getEnrollmentStatus(
                enrolled,
                section.capacity,
              );
              return (
                <div
                  key={section.id}
                  className="bg-white p-8 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-black mb-1 font-mono">
                        {section.code}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {section.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {section.department?.name || "Unknown"} - Year{" "}
                        {section.yearLevel}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(section.id, section.name)}
                        className="p-2 text-black hover:bg-gray-100 transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Advisor</span>
                      <span className="text-black font-medium">
                        {section.advisor || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Capacity</span>
                      <span className="text-black font-medium">
                        {section.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Enrollment</span>
                      <span className="text-black font-medium">
                        {enrolled}/{section.capacity}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100">
                      <div
                        className={`h-full transition-all ${
                          enrollmentStatus === "full"
                            ? "bg-black"
                            : enrollmentStatus === "high"
                              ? "bg-gray-600"
                              : "bg-gray-400"
                        }`}
                        style={{
                          width: `${(enrolled / section.capacity) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      {enrollmentStatus === "full" && "Section Full"}
                      {enrollmentStatus === "high" && "Almost Full"}
                      {enrollmentStatus === "normal" &&
                        `${section.capacity - enrolled} spots available`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Section Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Add New Section
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
                  01. Section Information
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Section A"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Section Code *
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
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors uppercase font-mono"
                      placeholder="SE-Y3-A"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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
                      disabled={isSubmitting}
                    >
                      <option value={0}>Select department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Year Level *
                    </label>
                    <select
                      value={formData.yearLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isSubmitting}
                    >
                      {yearLevels.map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Capacity & Advisor
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Maximum Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="40"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Section Advisor
                    </label>
                    <input
                      type="text"
                      value={formData.advisor}
                      onChange={(e) =>
                        setFormData({ ...formData, advisor: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Prof. Smith"
                      disabled={isSubmitting}
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
                    placeholder="Section description..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Section"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
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
