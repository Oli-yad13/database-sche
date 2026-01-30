"use client";

// Imports React hooks, icons, API clients, types, and toast for notifications
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  UserPlus,
  UserCog,
  BookPlus,
  LayoutGrid,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { departmentsApi, Department } from "@/lib/api/departments";
import { sectionsApi, Section, CreateSectionData } from "@/lib/api/sections";
import { coursesApi, Course, CreateCourseData } from "@/lib/api/courses";
import { roomsApi, Room } from "@/lib/api/rooms";
import { timeSlotsApi, TimeSlot } from "@/lib/api/timeslots";
import { authApi, RegisterData } from "@/lib/api/auth";
import { schedulesApi } from "@/lib/api/schedules";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";

// AdminSchedulingPage component manages the scheduling UI with tabs: overview, assign, and conflicts
export default function AdminSchedulingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "assign" | "conflicts"
  >("overview");

  // Form state for assignment wizard
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  // Data from API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictResult, setConflictResult] = useState<string | null>(null);

  // Teachers from API
  const [teachers, setTeachers] = useState<
    { id: number; username: string; email: string }[]
  >([]);

  // Quick Action modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // Add Student form
  const [studentForm, setStudentForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  // Add Teacher form
  const [teacherForm, setTeacherForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    role: "teacher",
  });

  // Add Course form
  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    code: "",
    name: "",
    description: "",
    departmentId: 0,
    creditHours: 3,
    level: 100,
    hasLab: false,
  });

  // Add Section form
  const [sectionForm, setSectionForm] = useState<CreateSectionData>({
    name: "",
    code: "",
    departmentId: 0,
    yearLevel: 1,
    capacity: 40,
    advisor: "",
    description: "",
  });

  // Fetch data on mount
  const fetchAllData = async () => {
    try {
      const [depts, sects, crses, rms, ts] = await Promise.all([
        departmentsApi.getAll(),
        sectionsApi.getAll(),
        coursesApi.getAll(),
        roomsApi.getAll(),
        timeSlotsApi.getAll(),
      ]);
      setDepartments(depts);
      setSections(sects);
      setCourses(crses);
      setRooms(rms);
      setTimeSlots(ts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    // Fetch teachers separately (may not have endpoint yet)
    try {
      const usersData = await apiClient.get<
        { id: number; username: string; email: string; role: string }[]
      >("/users?role=teacher");
      setTeachers(usersData);
    } catch {
      // Users endpoint may not exist yet - silent fail
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter sections by department
  const filteredSections = selectedDepartment
    ? sections.filter((s) => s.departmentId === parseInt(selectedDepartment))
    : sections;

  // Filter courses by department
  const filteredCourses = selectedDepartment
    ? courses.filter((c) => c.departmentId === parseInt(selectedDepartment))
    : courses;

  // Get selected items for summary
  const getSelectedDepartment = () =>
    departments.find((d) => d.id === parseInt(selectedDepartment));
  const getSelectedSection = () =>
    sections.find((s) => s.id === parseInt(selectedSection));
  const getSelectedCourse = () =>
    courses.find((c) => c.id === parseInt(selectedCourse));
  const getSelectedRoom = () =>
    rooms.find((r) => r.id === parseInt(selectedRoom));
  const getSelectedTimeSlot = () =>
    timeSlots.find((t) => t.id === parseInt(selectedTimeSlot));

  // Handle create schedule assignment
  const handleCreateAssignment = async () => {
    if (
      !selectedSection ||
      !selectedCourse ||
      !selectedTimeSlot ||
      !selectedRoom
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await schedulesApi.create({
        sectionId: parseInt(selectedSection),
        courseId: parseInt(selectedCourse),
        teacherId: selectedTeacher ? parseInt(selectedTeacher) : undefined,
        roomId: parseInt(selectedRoom),
        timeSlotId: parseInt(selectedTimeSlot),
      });
      toast.success("Schedule assignment created successfully!");
      handleReset();
      fetchAllData();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.conflicts?.join(", ") ||
        "Failed to create assignment";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle check for conflicts
  const handleCheckConflicts = async () => {
    const section = getSelectedSection();
    const room = getSelectedRoom();
    const timeSlot = getSelectedTimeSlot();

    if (!section || !room || !timeSlot) {
      toast.error(
        "Please select section, room, and time slot to check conflicts",
      );
      return;
    }

    // Check capacity conflict locally first
    if (section.capacity > room.capacity) {
      setConflictResult(
        `Capacity conflict: Section has ${section.capacity} students but room only fits ${room.capacity}`,
      );
      toast.error("Conflict detected!");
      return;
    }

    // Check for schedule conflicts via API
    try {
      const conflicts = await schedulesApi.checkConflicts({
        sectionId: parseInt(selectedSection),
        roomId: parseInt(selectedRoom),
        timeSlotId: parseInt(selectedTimeSlot),
      });

      if (conflicts && conflicts.length > 0) {
        setConflictResult(conflicts.join("; "));
        toast.error("Schedule conflict detected!");
      } else {
        setConflictResult("No conflicts detected! The assignment is valid.");
        toast.success("No conflicts found!");
      }
    } catch (error: any) {
      toast.error("Failed to check conflicts");
    }
  };

  // Handle reset
  const handleReset = () => {
    setSelectedDepartment("");
    setSelectedSection("");
    setSelectedCourse("");
    setSelectedTeacher("");
    setSelectedTimeSlot("");
    setSelectedRoom("");
    setConflictResult(null);
  };

  // Quick Action handlers
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.username || !studentForm.email || !studentForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setIsModalSubmitting(true);
      await authApi.register(studentForm);
      toast.success("Student created successfully");
      setShowAddStudentModal(false);
      setStudentForm({
        username: "",
        email: "",
        password: "",
        role: "student",
      });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create student");
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Handles creating a new teacher, validates form, calls API, resets form, and refreshes data
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.username || !teacherForm.email || !teacherForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setIsModalSubmitting(true);
      await authApi.register(teacherForm);
      toast.success("Teacher created successfully");
      setShowAddTeacherModal(false);
      setTeacherForm({
        username: "",
        email: "",
        password: "",
        role: "teacher",
      });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create teacher");
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Validates and submits a new course, resets form, closes modal, and refreshes data
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name || !courseForm.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setIsModalSubmitting(true);
      await coursesApi.create(courseForm);
      toast.success("Course created successfully");
      setShowAddCourseModal(false);
      setCourseForm({
        code: "",
        name: "",
        description: "",
        departmentId: 0,
        creditHours: 3,
        level: 100,
        hasLab: false,
      });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Validates and submits a new section, resets form, closes modal, and refreshes data
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name || !sectionForm.code || !sectionForm.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setIsModalSubmitting(true);
      await sectionsApi.create(sectionForm);
      toast.success("Section created successfully");
      setShowAddSectionModal(false);
      setSectionForm({
        name: "",
        code: "",
        departmentId: 0,
        yearLevel: 1,
        capacity: 40,
        advisor: "",
        description: "",
      });
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create section");
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Data will be fetched from API
  const stats = {
    students: sections.reduce(
      (sum, s) => sum + (s._count?.enrollments || 0),
      0,
    ),
    teachers: 3, // Would come from users API
    courses: courses.length,
    sections: sections.length,
    rooms: rooms.length,
    conflicts: 0,
  };

  const recentAssignments: any[] = [];
  const pendingAssignments: any[] = [];
  const conflicts: any[] = [];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Admin Dashboard
        </div>
        <h1 className="text-4xl font-bold text-black mb-2">
          Scheduling Management
        </h1>
        <p className="text-gray-600">
          Manage course assignments, teachers, students, and rooms
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. System Overview
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 bg-gray-200 p-1">
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <Users className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">
              {stats.students}
            </div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <GraduationCap className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">
              {stats.teachers}
            </div>
            <div className="text-sm text-gray-600">Teachers</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <BookOpen className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">
              {stats.courses}
            </div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <LayoutGrid className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">
              {stats.sections}
            </div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <DoorOpen className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">
              {stats.rooms}
            </div>
            <div className="text-sm text-gray-600">Rooms</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors border-2 border-black">
            <AlertTriangle className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">
              {stats.conflicts}
            </div>
            <div className="text-sm text-gray-600">Conflicts</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Management Tools
        </div>
        <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "assign"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("conflicts")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "conflicts"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            Conflicts
            {stats.conflicts > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {stats.conflicts}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Recent Assignments */}
          <div>
            <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
              03. Recent Assignments
            </div>
            <div className="border border-gray-200">
              {recentAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    index !== recentAssignments.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black mb-1">
                        {assignment.action}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {assignment.detail}
                      </div>
                      {assignment.room && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <DoorOpen className="h-3 w-3" />
                          {assignment.room}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {assignment.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
              04. Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-1 bg-gray-200 p-1">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="bg-white p-8 hover:bg-black hover:text-white transition-colors group text-left"
              >
                <UserPlus className="h-6 w-6 mb-4 text-black group-hover:text-white" />
                <div className="text-sm font-medium">Add Student</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">
                  Enroll new student
                </div>
              </button>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="bg-white p-8 hover:bg-black hover:text-white transition-colors group text-left"
              >
                <UserCog className="h-6 w-6 mb-4 text-black group-hover:text-white" />
                <div className="text-sm font-medium">Add Teacher</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">
                  Register new teacher
                </div>
              </button>
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="bg-white p-8 hover:bg-black hover:text-white transition-colors group text-left"
              >
                <BookPlus className="h-6 w-6 mb-4 text-black group-hover:text-white" />
                <div className="text-sm font-medium">Create Course</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">
                  Add new course
                </div>
              </button>
              <button
                onClick={() => setShowAddSectionModal(true)}
                className="bg-white p-8 hover:bg-black hover:text-white transition-colors group text-left"
              >
                <LayoutGrid className="h-6 w-6 mb-4 text-black group-hover:text-white" />
                <div className="text-sm font-medium">Create Section</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">
                  Schedule new section
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assign" && (
        <div>
          <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
            03. Pending Assignments
          </div>
          <div className="grid gap-1 bg-gray-200 p-1">
            {pendingAssignments.map((assignment, index) => (
              <div
                key={index}
                className="bg-white p-8 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <div className="text-xl font-bold text-black">
                        {assignment.course} - {assignment.section}
                      </div>
                      <div className="px-2 py-1 text-xs font-medium border border-gray-300 bg-white text-gray-600">
                        YEAR {assignment.yearLevel}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {assignment.students} students enrolled
                    </div>
                  </div>

                  {/* Assignment Actions */}
                  <div className="flex items-center gap-2">
                    {assignment.status === "needs_teacher" && (
                      <button className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        Assign Teacher
                      </button>
                    )}
                    {assignment.status === "needs_room" && (
                      <button className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <DoorOpen className="h-4 w-4" />
                        Assign Room
                      </button>
                    )}
                    {assignment.status === "complete" && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4" />
                        Complete
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assignment Wizard */}
          <div className="mt-12">
            <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
              04. Assignment Wizard
            </div>
            <div className="border border-gray-200 p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-sm font-medium text-black mb-4">
                    1. Select Department
                  </div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedSection("");
                      setSelectedCourse("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Choose department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-sm font-medium text-black mb-4">
                    2. Select Section
                  </div>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Choose section...</option>
                    {filteredSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.code} (Year {section.yearLevel},{" "}
                        {section.capacity} capacity)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-sm font-medium text-black mb-4">
                    3. Select Course
                  </div>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Choose course...</option>
                    {filteredCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name} ({course.creditHours}{" "}
                        credits{course.hasLab ? ", Lab" : ""})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-sm font-medium text-black mb-4">
                    4. Assign Teacher
                  </div>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Choose teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.username} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-sm font-medium text-black mb-4">
                    5. Select Time Slot
                  </div>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Choose time slot...</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.code} (
                        {slot.days.map((d) => d.substring(0, 3)).join("/")}{" "}
                        {slot.startTime}-{slot.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-sm font-medium text-black mb-4">
                    6. Assign Room
                  </div>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Choose room...</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.capacity} capacity, {room.building},
                        Floor {room.floor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-sm font-medium text-black mb-4">
                  Assignment Summary
                </div>
                <div className="bg-gray-50 p-6 mb-6">
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Section</div>
                      <div className="text-black font-medium">
                        {getSelectedSection()
                          ? `${getSelectedSection()?.code} (${getSelectedSection()?.capacity} capacity)`
                          : "Not selected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Course</div>
                      <div className="text-black font-medium">
                        {getSelectedCourse()
                          ? `${getSelectedCourse()?.code} - ${getSelectedCourse()?.name}`
                          : "Not selected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Teacher</div>
                      <div className="text-black font-medium">
                        {selectedTeacher
                          ? teachers.find(
                              (t) => t.id === parseInt(selectedTeacher),
                            )?.username || "Unknown"
                          : "Not selected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Time</div>
                      <div className="text-black font-medium">
                        {getSelectedTimeSlot()
                          ? `${getSelectedTimeSlot()
                              ?.days.map((d) => d.substring(0, 3))
                              .join(
                                "/",
                              )} ${getSelectedTimeSlot()?.startTime}-${getSelectedTimeSlot()?.endTime}`
                          : "Not selected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Room</div>
                      <div className="text-black font-medium">
                        {getSelectedRoom()
                          ? `${getSelectedRoom()?.name} (${getSelectedRoom()?.building}, Floor ${getSelectedRoom()?.floor})`
                          : "Not selected"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Capacity Check</div>
                      <div className="text-black font-medium">
                        {getSelectedSection() && getSelectedRoom()
                          ? `${getSelectedSection()?.capacity}/${getSelectedRoom()?.capacity} ${getSelectedSection()!.capacity <= getSelectedRoom()!.capacity ? "✓" : "✗"}`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {conflictResult && (
                  <div
                    className={`p-4 mb-6 border ${conflictResult.includes("No conflicts") ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"}`}
                  >
                    {conflictResult}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCreateAssignment}
                    disabled={
                      isSubmitting ||
                      !selectedSection ||
                      !selectedCourse ||
                      !selectedTimeSlot ||
                      !selectedRoom
                    }
                    className="px-8 py-3 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Creating..."
                      : "Create Schedule Assignment"}
                  </button>
                  <button
                    onClick={handleCheckConflicts}
                    disabled={
                      !selectedSection || !selectedRoom || !selectedTimeSlot
                    }
                    className="px-8 py-3 text-sm font-medium border border-gray-300 text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check for Conflicts
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-8 py-3 text-sm font-medium border border-gray-300 text-black hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts Tab */}
      {activeTab === "conflicts" && (
        <div>
          <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
            03. Scheduling Conflicts ({conflicts.length})
          </div>
          <div className="space-y-4">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className={`border-2 p-6 ${
                  conflict.severity === "critical"
                    ? "border-black bg-gray-50"
                    : conflict.severity === "high"
                      ? "border-gray-400 bg-white"
                      : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-black" />
                      <div className="text-lg font-bold text-black">
                        {conflict.type}
                      </div>
                      <div
                        className={`px-3 py-1 text-xs font-medium ${
                          conflict.severity === "critical"
                            ? "bg-black text-white"
                            : conflict.severity === "high"
                              ? "border border-black text-black bg-white"
                              : "border border-gray-300 text-gray-600 bg-white"
                        }`}
                      >
                        {conflict.severity.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {conflict.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Affected:</span>
                      {conflict.affected.map((item: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 border border-gray-300 bg-white"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors whitespace-nowrap">
                    Resolve →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {conflicts.length === 0 && (
            <div className="border border-gray-200 p-12 text-center">
              <Check className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-400">
                No conflicts detected
              </div>
              <div className="text-sm text-gray-400 mt-2">
                All assignments are valid
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Quick Action
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Add New Student
                </h2>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  01. Student Information
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={studentForm.username}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="john.doe"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="john.doe@university.edu"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={studentForm.password}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                    placeholder="Min 8 chars, upper+lower+number+special"
                    required
                    disabled={isModalSubmitting}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isModalSubmitting ? "Creating..." : "Create Student"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  disabled={isModalSubmitting}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Quick Action
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Add New Teacher
                </h2>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  01. Teacher Information
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={teacherForm.username}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="prof.smith"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="smith@university.edu"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                    placeholder="Min 8 chars, upper+lower+number+special"
                    required
                    disabled={isModalSubmitting}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isModalSubmitting ? "Creating..." : "Create Teacher"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  disabled={isModalSubmitting}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Quick Action
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Create New Course
                </h2>
              </div>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-8 space-y-8">
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
                      value={courseForm.code}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors uppercase"
                      placeholder="SE301"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={courseForm.name}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Data Structures"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors resize-none"
                    placeholder="Course description..."
                    disabled={isModalSubmitting}
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
                      value={courseForm.departmentId}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          departmentId: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isModalSubmitting}
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
                      Credit Hours *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={courseForm.creditHours}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          creditHours: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Level *
                    </label>
                    <select
                      value={courseForm.level}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          level: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isModalSubmitting}
                    >
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                      <option value={400}>400</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="courseHasLab"
                    checked={courseForm.hasLab}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, hasLab: e.target.checked })
                    }
                    className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                    disabled={isModalSubmitting}
                  />
                  <label
                    htmlFor="courseHasLab"
                    className="text-sm font-medium text-black"
                  >
                    This course has a lab component
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isModalSubmitting ? "Creating..." : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  disabled={isModalSubmitting}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Quick Action
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Create New Section
                </h2>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSection} className="p-8 space-y-8">
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
                      value={sectionForm.name}
                      onChange={(e) =>
                        setSectionForm({ ...sectionForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Section A"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Section Code *
                    </label>
                    <input
                      type="text"
                      value={sectionForm.code}
                      onChange={(e) =>
                        setSectionForm({
                          ...sectionForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors uppercase font-mono"
                      placeholder="SE-Y3-A"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Department *
                    </label>
                    <select
                      value={sectionForm.departmentId}
                      onChange={(e) =>
                        setSectionForm({
                          ...sectionForm,
                          departmentId: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isModalSubmitting}
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
                      value={sectionForm.yearLevel}
                      onChange={(e) =>
                        setSectionForm({
                          ...sectionForm,
                          yearLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isModalSubmitting}
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
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
                      value={sectionForm.capacity}
                      onChange={(e) =>
                        setSectionForm({
                          ...sectionForm,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="40"
                      required
                      disabled={isModalSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Section Advisor
                    </label>
                    <input
                      type="text"
                      value={sectionForm.advisor}
                      onChange={(e) =>
                        setSectionForm({
                          ...sectionForm,
                          advisor: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Prof. Smith"
                      disabled={isModalSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={sectionForm.description}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors resize-none"
                    placeholder="Section description..."
                    disabled={isModalSubmitting}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isModalSubmitting ? "Creating..." : "Create Section"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  disabled={isModalSubmitting}
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
