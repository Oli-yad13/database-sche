"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { eventsApi, Event, CreateEventData } from "@/lib/api/events";
import toast from "react-hot-toast";

// EventsManagementPage component state initialization for handling search, event type filtering, modals, event data, loading/submitting states,
export default function EventsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Initializes form state for creating or editing an event, including title, description, type, dates, and scheduling flags.
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    eventType: "holiday",
    startDate: "",
    endDate: "",
    isAllDay: true,
    affectsSchedule: false,
  });
  // Defines the list of possible event types with corresponding display labels for dropdown selection.
  const eventTypes = [
    { value: "holiday", label: "Holiday" },
    { value: "break", label: "Break" },
    { value: "exam_period", label: "Exam Period" },
    { value: "registration", label: "Registration" },
    { value: "orientation", label: "Orientation" },
    { value: "graduation", label: "Graduation" },
    { value: "special_event", label: "Special Event" },
    { value: "academic_event", label: "Academic Event" },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetches all events from the API, updates state, manages loading indicator, and shows a toast on fa
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      toast.error("Failed to load events");
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles event form submission: validates required fields, creates or updates an event via API, manages loading state, and shows succ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.eventType
    ) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        await eventsApi.update(editingId, formData);
        toast.success("Event updated successfully");
      } else {
        await eventsApi.create(formData);
        toast.success("Event created successfully");
      }

      setShowAddModal(false);
      setEditingId(null);

      // Resets the event form, refreshes the event list, and handles API errors after creating or updating an event.
      setFormData({
        title: "",
        description: "",
        eventType: "holiday",
        startDate: "",
        endDate: "",
        isAllDay: true,
        affectsSchedule: false,
      });

      fetchEvents();
      fetchEvents();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingId ? "update" : "create"} event`,
      );
      console.error("Error saving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletes an event after confirmation, handles 404 and other API errors, shows toast feedback, and refreshes the event lis
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await eventsApi.delete(id);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        toast.error("Event no longer exists. Refreshing list...");
        fetchEvents();
      } else {
        toast.error(error.response?.data?.message || "Failed to delete event");
      }
      console.error("Error deleting event:", error);
    }
  };

  // Filters events based on search query and selected event type, returning only matching results.
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType =
      selectedType === "all" || event.eventType === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Event Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Events & Holidays
            </h1>
            <p className="text-gray-600">
              Manage academic calendar and special events
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                title: "",
                description: "",
                eventType: "holiday",
                startDate: "",
                endDate: "",
                isAllDay: true,
                affectsSchedule: false,
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Add Event
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
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Event Types</option>
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Events ({isLoading ? "..." : filteredEvents.length})
        </div>
        <div className="border border-gray-200">
          {isLoading ? (
            // Skeleton Loading
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 border-b border-gray-200 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No events found matching your criteria
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  index !== filteredEvents.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-lg font-bold text-black">
                        {event.title}
                      </div>
                      {event.affectsSchedule && (
                        <AlertCircle className="h-4 w-4 text-black" />
                      )}
                    </div>
                    {event.description && (
                      <div className="text-sm text-gray-600 mb-3">
                        {event.description}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.startDate)}
                        {event.endDate !== event.startDate &&
                          ` - ${formatDate(event.endDate)}`}
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium border border-gray-300 text-gray-600 uppercase`}
                      >
                        {event.eventType.replace("_", " ")}
                      </span>
                      {event.affectsSchedule && (
                        <span className="px-3 py-1 text-xs font-medium border border-black text-black uppercase">
                          Affects Schedule
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(event.id);
                        setFormData({
                          title: event.title,
                          description: event.description || "",
                          eventType: event.eventType,
                          startDate: new Date(event.startDate)
                            .toISOString()
                            .split("T")[0],
                          endDate: new Date(event.endDate)
                            .toISOString()
                            .split("T")[0],
                          isAllDay: event.isAllDay,
                          affectsSchedule: event.affectsSchedule,
                        });
                        setShowAddModal(true);
                      }}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Event Management
                </div>
                <h2 className="text-2xl font-bold text-black">
                  {editingId ? "Edit Event" : "Add New Event"}
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
                  01. Event Information
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                    placeholder="Spring Break"
                    required
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
                    placeholder="Event description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({ ...formData, eventType: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Date & Time
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isAllDay"
                      checked={formData.isAllDay}
                      onChange={(e) =>
                        setFormData({ ...formData, isAllDay: e.target.checked })
                      }
                      className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                    />
                    <label
                      htmlFor="isAllDay"
                      className="text-sm font-medium text-black"
                    >
                      All day event
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="affectsSchedule"
                      checked={formData.affectsSchedule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          affectsSchedule: e.target.checked,
                        })
                      }
                      className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                    />
                    <label
                      htmlFor="affectsSchedule"
                      className="text-sm font-medium text-black"
                    >
                      Affects class schedule (no classes during this event)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
                >
                  {isSubmitting
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                      ? "Update Event"
                      : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 transition-colors font-medium"
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
