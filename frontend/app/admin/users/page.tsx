"use client";

// Imports React hooks, icons, API utilities, and toast notifications for user management functionality.
import { useState, useEffect } from "react";
import { UserPlus, Search, Edit2, Trash2, X } from "lucide-react";
import { usersApi, User, CreateUserData } from "@/lib/api/users";
import toast from "react-hot-toast";

// Initializes state for user management, including search, role filter, modals, user list, loading, submission status, and currently editing user.
export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "all" | "student" | "teacher" | "admin"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // State for the user form, holding input values for creating or editing a user.
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    role: "student",
    isActive: true,
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetches all users from the API and updates state, showing a loading indicator and handling errors.
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Fetch ALL users once, filter locally
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles form submission to create a new user, validates required fields, shows success/error notifications, resets form, and refreshes the user list.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      (!editingUser && !formData.password)
    ) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await usersApi.create(formData);
      toast.success("User created successfully");
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updates a user with non-empty fields, shows success/error toasts, closes the edit modal, resets the form, and refreshes the user list
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password; // Don't send empty password

      await usersApi.update(editingUser.id, updateData);
      toast.success("User updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletes a user after confirmation, handles 404 or other errors, shows success/error toasts, and refreshes the user list
  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;

    try {
      await usersApi.delete(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        toast.error("User no longer exists. Refreshing list...");
        fetchUsers();
      } else {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
      console.error("Error deleting user:", error);
    }
  };

  // Prepares a user for editing by populating the form and opening the edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't fill password
      role: user.role,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  // Resets the form fields to their default values
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "student",
      isActive: true,
    });
  };

  // Client-side filtering
  // Filters users based on search query and selected role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          User Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Users</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Add User
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
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Users ({isLoading ? "..." : filteredUsers.length})
        </div>
        <div className="border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-medium uppercase tracking-wide text-gray-600">
            <div className="col-span-3">Username</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            // Skeleton Loading
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-4 px-6 py-6 border-b border-gray-200 animate-pulse"
              >
                <div className="col-span-3">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-3">
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="h-4 w-12 bg-gray-200 rounded inline-block"></div>
                </div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No users found matching your criteria
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 px-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-3 flex items-center">
                  <div className="text-sm font-medium text-black">
                    {user.username}
                  </div>
                </div>
                <div className="col-span-3 flex items-center">
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="col-span-2 flex items-center">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-black text-white"
                        : user.role === "teacher"
                          ? "border border-black text-black"
                          : "border border-gray-300 text-gray-600"
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium ${
                      user.isActive
                        ? "border border-black text-black"
                        : "border border-gray-300 text-gray-400"
                    }`}
                  >
                    {user.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-black hover:bg-gray-100 transition-colors"
                    title="Edit User"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.username)}
                    className="p-2 text-black hover:bg-gray-100 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  User Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  {showEditModal ? "Edit User" : "Add New User"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={showEditModal ? handleUpdate : handleSubmit}
              className="p-8 space-y-8"
            >
              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  01. User Information
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="john.doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="john.doe@university.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password {showEditModal && "(Leave blank to keep current)"}{" "}
                    *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                    placeholder="••••••••"
                    required={!showEditModal}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Role Selection
                </div>

                <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1">
                  {["student", "teacher", "admin"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: role as any })
                      }
                      className={`px-6 py-4 transition-colors text-sm font-medium ${
                        formData.role === role
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-gray-50"
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  03. Account Status
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-black"
                  >
                    Account is active
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
                >
                  {isSubmitting
                    ? "Saving..."
                    : showEditModal
                      ? "Update User"
                      : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
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
