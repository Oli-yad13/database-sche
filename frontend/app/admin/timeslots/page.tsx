"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Trash2, X } from "lucide-react";
import {
  timeSlotsApi,
  TimeSlot,
  CreateTimeSlotData,
} from "@/lib/api/timeslots";
import toast from "react-hot-toast";

// Component state for managing time slots, filtering, loading, and modal visibility
export default function TimeSlotsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the time slot form data with default empty values
  const [formData, setFormData] = useState<CreateTimeSlotData>({
    code: "",
    startTime: "",
    endTime: "",
    days: [],
  });

  // Array of weekdays and initial fetch of time slots on component mount
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  // Fetches all time slots from the API and updates state, showing a loading indicator and error toast if it fails
  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true);
      const data = await timeSlotsApi.getAll();
      setTimeSlots(data);
    } catch (error) {
      toast.error("Failed to load time slots");
    } finally {
      setIsLoading(false);
    }
  };

  // Handles form submission to create a new time slot, validating input, showing success/error toasts, and refreshing the list
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.code ||
      !formData.startTime ||
      !formData.endTime ||
      formData.days.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and select at least one day",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await timeSlotsApi.create(formData);
      toast.success("Time slot created successfully");
      setShowAddModal(false);
      setFormData({
        code: "",
        startTime: "",
        endTime: "",
        days: [],
      });
      fetchTimeSlots();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create time slot",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirms and deletes a time slot by ID, showing success/error notifications and refreshing the list
  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Are you sure you want to delete time slot ${code}?`)) return;

    try {
      await timeSlotsApi.delete(id);
      toast.success("Time slot deleted successfully");
      fetchTimeSlots();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete time slot",
      );
    }
  };

  // Toggles a day in the form's `days` array, adding it if absent or removing it if present
  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  // Filters time slots by search query and selected day, returning only matching slots
  const filteredTimeSlots = timeSlots.filter((slot) => {
    const matchesSearch =
      slot.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.startTime.includes(searchQuery) ||
      slot.endTime.includes(searchQuery);
    const matchesDay = selectedDay === "all" || slot.days.includes(selectedDay);
    return matchesSearch && matchesDay;
  });

  // Converts an array of days into a concise string representation (e.g., "Mon-Fri", "MWF").
  const formatDays = (days: string[]) => {
    if (days.length === 5) return "Mon-Fri";
    if (
      days.length === 3 &&
      days.includes("Monday") &&
      days.includes("Wednesday") &&
      days.includes("Friday")
    ) {
      return "MWF";
    }
    if (
      days.length === 2 &&
      days.includes("Tuesday") &&
      days.includes("Thursday")
    ) {
      return "TTh";
    }
    if (
      days.length === 2 &&
      days.includes("Monday") &&
      days.includes("Wednesday")
    ) {
      return "MW";
    }
    return days.map((d) => d.substring(0, 3)).join(", ");
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Time Slot Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Time Slots</h1>
            <p className="text-gray-600">
              Manage class time schedules and periods
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <Clock className="h-5 w-5" />
            Add Time Slot
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
              placeholder="Search by code or time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Day Filter */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Days</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Time Slots ({filteredTimeSlots.length})
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-gray-200 p-1">
          {filteredTimeSlots.length === 0 ? (
            <div className="col-span-3 bg-white p-12 text-center text-gray-400">
              No time slots found matching your criteria
            </div>
          ) : (
            filteredTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white p-8 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-black mb-1 font-mono">
                      {slot.code}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(slot.id, slot.code)}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Delete time slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Days</span>
                    <span className="px-3 py-1 text-xs font-medium border border-gray-300 text-black uppercase">
                      {formatDays(slot.days)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-black font-medium">
                      {slot.duration} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 text-xs font-medium ${
                        slot.isActive
                          ? "border border-black text-black"
                          : "border border-gray-300 text-gray-400"
                      }`}
                    >
                      {slot.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Time Slot Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Add New Time Slot
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
                  01. Time Information
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Slot Code *
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
                    placeholder="MWF-08"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Format: Days-Hour (e.g., MWF-08 for Monday/Wednesday/Friday
                    at 8am)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Days of Week *
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={day}
                        checked={formData.days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor={day}
                        className="text-sm font-medium text-black"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Time Slot"}
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
