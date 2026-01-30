"use client";

import { useState, useEffect } from "react";
import { Building2, Search, Edit2, Trash2, X } from "lucide-react";
import {
  departmentsApi,
  Department,
  CreateDepartmentData,
} from "@/lib/api/departments";
import toast from "react-hot-toast";

// DepartmentsManagementPage component state initialization for handling search, modals, editing, department data, and loading/submitting states.
export default function DepartmentsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateDepartmentData>({
    code: "",
    name: "",
    description: "",
    faculty: "",
    headOfDepartment: "",
    headEmail: "",
  });

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to load departments");
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles department creation: validates input, submits to API, manages loading state, resets form on success, refreshes list, and shows error toasts if needed.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await departmentsApi.create(formData);
      toast.success("Department created successfully");
      setShowAddModal(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        faculty: "",
        headOfDepartment: "",
        headEmail: "",
      });
      fetchDepartments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create department",
      );
      console.error("Error creating department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletes a department with confirmation, handles API errors including 404s, shows toast feedback, and refreshes the department list.
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await departmentsApi.delete(id);
      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        toast.error("Department no longer exists. Refreshing list...");
        fetchDepartments(); // Refresh to get current state
      } else {
        toast.error(
          error.response?.data?.message || "Failed to delete department",
        );
      }
      console.error("Error deleting department:", error);
    }
  };

  // Prepares a department for editing by populating the form with its data and opening the edit modal.
  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || "",
      faculty: dept.faculty || "",
      headOfDepartment: dept.headOfDepartment || "",
      headEmail: dept.headEmail || "",
    });
    setShowEditModal(true);
  };

  // Handles updating a department: validates input, submits changes to the API, manages loading state, resets form and editing state on success, refreshes list, and displays errors via toast.
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDepartment) return;

    if (!formData.code || !formData.name) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await departmentsApi.update(editingDepartment.id, formData);
      toast.success("Department updated successfully");
      setShowEditModal(false);
      setEditingDepartment(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        faculty: "",
        headOfDepartment: "",
        headEmail: "",
      });
      fetchDepartments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update department",
      );
      console.error("Error updating department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter departments locally for instant search feedback
  const filteredDepartments = departments.filter((dept) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dept.code.toLowerCase().includes(query) ||
      dept.name.toLowerCase().includes(query) ||
      (dept.faculty && dept.faculty.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Department Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Departments</h1>
            <p className="text-gray-600">
              Manage academic departments and faculties
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <Building2 className="h-5 w-5" />
            Add Department
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. Search
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Departments ({isLoading ? "..." : filteredDepartments.length})
        </div>
        <div className="grid md:grid-cols-2 gap-1 bg-gray-200 p-1">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-8 animate-pulse">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-28 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 mt-6">
                    <div className="bg-white p-4">
                      <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 w-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-white p-4">
                      <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredDepartments.length === 0 ? (
            <div className="col-span-2 bg-white p-12 text-center text-gray-400">
              No departments found matching your criteria
            </div>
          ) : (
            filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white p-8 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl font-bold text-black">
                        {dept.code}
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium ${
                          dept.isActive
                            ? "border border-black text-black"
                            : "border border-gray-300 text-gray-400"
                        }`}
                      >
                        {dept.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="text-lg font-medium text-black mb-1">
                      {dept.name}
                    </div>
                    <div className="text-sm text-gray-600">{dept.faculty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Edit department"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Delete department"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Head of Department</span>
                    <span className="text-black font-medium">
                      {dept.headOfDepartment}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1">
                  <div className="bg-white p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Courses
                    </div>
                    <div className="text-xl font-bold text-black">
                      {(dept as any)._count?.courses || 0}
                    </div>
                  </div>
                  <div className="bg-white p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Sections
                    </div>
                    <div className="text-xl font-bold text-black">
                      {(dept as any)._count?.sections || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Department Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Add New Department
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
                      Department Code *
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
                      placeholder="SE"
                      maxLength={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Software Engineering"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Faculty
                  </label>
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) =>
                      setFormData({ ...formData, faculty: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                    placeholder="Engineering"
                  />
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
                    placeholder="Department description..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Head of Department
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.headOfDepartment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          headOfDepartment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Dr. Sarah Johnson"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.headEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, headEmail: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="head@department.edu"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? "Creating..." : "Create Department"}
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

      {/* Edit Department Modal */}
      {showEditModal && editingDepartment && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Department Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Edit Department
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDepartment(null);
                  setFormData({
                    code: "",
                    name: "",
                    description: "",
                    faculty: "",
                    headOfDepartment: "",
                    headEmail: "",
                  });
                }}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdate} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  01. Basic Information
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Department Code *
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
                      placeholder="SE"
                      maxLength={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Software Engineering"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Faculty
                  </label>
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) =>
                      setFormData({ ...formData, faculty: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                    placeholder="Engineering"
                  />
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
                    placeholder="Department description..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Head of Department
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.headOfDepartment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          headOfDepartment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Dr. Sarah Johnson"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.headEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, headEmail: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="head@department.edu"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? "Updating..." : "Update Department"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDepartment(null);
                    setFormData({
                      code: "",
                      name: "",
                      description: "",
                      faculty: "",
                      headOfDepartment: "",
                      headEmail: "",
                    });
                  }}
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
