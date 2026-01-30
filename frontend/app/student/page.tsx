'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { schedulesApi, Schedule } from '@/lib/api/schedules';
import { eventsApi, Event } from '@/lib/api/events';
import { sectionsApi, Section } from '@/lib/api/sections';
import { departmentsApi, Department } from '@/lib/api/departments';

interface StudentAuthData {
  studentId: string;
  department: string;
  yearLevel: string;
  role: string;
}

interface Session {
  time: string;
  course: string;
  courseName: string;
  teacher: string;
  room: string;
  building: string;
  floor: number;
}

interface DaySchedule {
  day: string;
  sessions: Session[];
}

interface SemesterCourse {
  code: string;
  name: string;
  teacher: string;
  schedule: string;
  room: string;
  building: string;
  floor: number;
}

interface UpcomingEvent {
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  affectsSchedule: boolean;
}

export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'week' | 'semester'>('week');
  const [studentAuth, setStudentAuth] = useState<StudentAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [semesterCourses, setSemesterCourses] = useState<SemesterCourse[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<UpcomingEvent | null>(null);

  // Load student auth from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('studentAuth');
    if (stored) {
      try {
        setStudentAuth(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing studentAuth:', e);
      }
    }
  }, []);

  // Fetch schedules based on student's department and year level
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!studentAuth) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Find department by code
        const departments = await departmentsApi.getAll();
        const dept = departments.find(d => d.code === studentAuth.department);

        if (!dept) {
          console.error('Department not found:', studentAuth.department);
          setIsLoading(false);
          return;
        }

        // Find sections matching department and year level
        const sections = await sectionsApi.getAll();
        const matchingSections = sections.filter(
          s => s.departmentId === dept.id && s.yearLevel === parseInt(studentAuth.yearLevel)
        );

        if (matchingSections.length === 0) {
          console.log('No sections found for department and year level');
          setIsLoading(false);
          return;
        }

        // Fetch all schedules
        const allSchedules = await schedulesApi.getAll();

        // Filter schedules for the student's sections
        const studentSchedules = allSchedules.filter(
          schedule => matchingSections.some(section => section.id === schedule.sectionId)
        );

        // Convert to weekly schedule format
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const weeklyData: DaySchedule[] = days.map(day => ({
          day,
          sessions: studentSchedules
            .filter(schedule => schedule.timeSlot?.days?.includes(day))
            .map(schedule => ({
              time: `${schedule.timeSlot?.startTime} - ${schedule.timeSlot?.endTime}`,
              course: schedule.course?.code || '',
              courseName: schedule.course?.name || '',
              teacher: schedule.teacher?.username || 'TBA',
              room: schedule.room?.name || '',
              building: schedule.room?.building || '',
              floor: schedule.room?.floor || 0,
            }))
            .sort((a, b) => a.time.localeCompare(b.time)),
        }));

        setWeeklySchedule(weeklyData);

        // Convert to semester courses format
        const coursesMap = new Map<string, SemesterCourse>();
        studentSchedules.forEach(schedule => {
          const code = schedule.course?.code || '';
          if (!coursesMap.has(code)) {
            const daysStr = schedule.timeSlot?.days?.map((d: string) => d.substring(0, 3)).join('/') || '';
            coursesMap.set(code, {
              code,
              name: schedule.course?.name || '',
              teacher: schedule.teacher?.username || 'TBA',
              schedule: `${daysStr} ${schedule.timeSlot?.startTime}-${schedule.timeSlot?.endTime}`,
              room: schedule.room?.name || '',
              building: schedule.room?.building || '',
              floor: schedule.room?.floor || 0,
            });
          }
        });
        setSemesterCourses(Array.from(coursesMap.values()));

        // Fetch events
        const events = await eventsApi.getAll();
        const now = new Date();
        const upcomingEvts = events
          .filter(e => new Date(e.endDate) >= now)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 5)
          .map(e => ({
            title: e.title,
            startDate: new Date(e.startDate).toLocaleDateString(),
            endDate: new Date(e.endDate).toLocaleDateString(),
            type: e.eventType,
            affectsSchedule: e.affectsSchedule,
          }));
        setUpcomingEvents(upcomingEvts);

        // Check for active event today
        const active = events.find(e => {
          const startDate = new Date(e.startDate);
          const endDate = new Date(e.endDate);
          // Reset time part for accurate date comparison
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return now >= startDate && now <= endDate && e.affectsSchedule;
        });

        if (active) {
          setActiveEvent({
            title: active.title,
            startDate: new Date(active.startDate).toLocaleDateString(),
            endDate: new Date(active.endDate).toLocaleDateString(),
            type: active.eventType,
            affectsSchedule: active.affectsSchedule,
          });
        } else {
          setActiveEvent(null);
        }

      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [studentAuth]);

  // Get department name from code
  const getDepartmentName = (code: string) => {
    const departments: { [key: string]: string } = {
      'SE': 'Software Engineering',
      'CS': 'Computer Science',
      'IT': 'Information Technology',
      'CE': 'Computer Engineering',
    };
    return departments[code] || code;
  };

  // Use studentAuth data if available, otherwise use user data
  const studentInfo = {
    studentId: studentAuth?.studentId || user?.username || '',
    program: studentAuth ? getDepartmentName(studentAuth.department) : '',
    yearLevel: studentAuth ? parseInt(studentAuth.yearLevel) : 0,
    semester: 'Spring 2026',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Student Schedule
        </div>
        <h1 className="text-4xl font-bold text-black mb-2">
          {studentInfo.studentId || user?.username || 'Student'}
        </h1>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          {studentInfo.program && (
            <>
              <div>{studentInfo.program}</div>
              <div>•</div>
            </>
          )}
          {studentInfo.yearLevel > 0 && (
            <>
              <div>Year {studentInfo.yearLevel}</div>
              <div>•</div>
            </>
          )}
          <div>{studentInfo.semester}</div>
        </div>
      </div>

      {/* Active Event Banner */}
      {activeEvent && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                NO CLASSES TODAY: {activeEvent.title}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Classes are cancelled from {activeEvent.startDate} to {activeEvent.endDate} due to {activeEvent.type}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. My Schedule
        </div>
        <div className="grid grid-cols-2 gap-1 bg-gray-200 p-1 max-w-md">
          <button
            onClick={() => setSelectedView('week')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${selectedView === 'week'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
              }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setSelectedView('semester')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${selectedView === 'semester'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-50'
              }`}
          >
            Semester View
          </button>
        </div>
      </div>

      {/* Weekly Schedule View */}
      {selectedView === 'week' && (
        <div>
          <div className="border border-gray-200">
            {weeklySchedule.map((day, dayIndex) => (
              <div
                key={day.day}
                className={`${dayIndex !== weeklySchedule.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
              >
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-black uppercase tracking-wide">
                    {day.day}
                  </div>
                </div>

                {day.sessions.length === 0 ? (
                  <div className="p-6 text-sm text-gray-400">No classes scheduled</div>
                ) : (
                  <div>
                    {day.sessions.map((session, sessionIndex) => (
                      <div
                        key={sessionIndex}
                        className={`p-6 hover:bg-gray-50 transition-colors ${sessionIndex !== day.sessions.length - 1
                          ? 'border-b border-gray-200'
                          : ''
                          }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Time & Course */}
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Clock className="h-3 w-3" />
                              {session.time}
                            </div>
                            <div className="text-xl font-bold text-black mb-1">
                              {session.course}
                            </div>
                            <div className="text-sm text-gray-600">
                              {session.courseName}
                            </div>
                          </div>

                          {/* Teacher */}
                          <div>
                            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                              Instructor
                            </div>
                            <div className="flex items-center gap-2 text-sm text-black">
                              <User className="h-4 w-4" />
                              {session.teacher}
                            </div>
                          </div>

                          {/* Location */}
                          <div>
                            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                              Location
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-black">
                                <MapPin className="h-4 w-4" />
                                Room {session.room}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 className="h-4 w-4" />
                                {session.building}, Floor {session.floor}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semester View */}
      {selectedView === 'semester' && (
        <div className="grid md:grid-cols-2 gap-1 bg-gray-200 p-1">
          {semesterCourses.map((course, index) => (
            <div key={index} className="bg-white p-8 hover:bg-gray-50 transition-colors">
              <div className="text-xl font-bold text-black mb-1">{course.code}</div>
              <div className="text-sm text-gray-600 mb-6">{course.name}</div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Instructor
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black">
                    <User className="h-4 w-4" />
                    {course.teacher}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Schedule
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black">
                    <Clock className="h-4 w-4" />
                    {course.schedule}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Location
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-black">
                      <MapPin className="h-4 w-4" />
                      Room {course.room}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      {course.building}, Floor {course.floor}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 italic">
                Schedule managed by administration
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Events & Holidays */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Upcoming Events & Holidays
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="border border-gray-200 p-6 text-center text-gray-400">
            No upcoming events
          </div>
        ) : (
          <div className="border border-gray-200">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className={`p-6 hover:bg-gray-50 transition-colors ${index !== upcomingEvents.length - 1 ? 'border-b border-gray-200' : ''
                  } ${event.affectsSchedule ? 'bg-yellow-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-lg font-bold text-black">{event.title}</div>
                      {event.affectsSchedule && (
                        <span className="px-2 py-1 text-xs font-bold bg-black text-white">
                          NO CLASSES
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {event.startDate}
                        {event.endDate !== event.startDate && ` - ${event.endDate}`}
                      </div>
                    </div>
                    {event.affectsSchedule && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                        <AlertCircle className="h-4 w-4" />
                        <span>All classes are cancelled during this period</span>
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium border ${event.affectsSchedule
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-gray-600'
                    }`}>
                    {event.type.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          03. Summary
        </div>
        <div className="border border-gray-200 p-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Total Courses</div>
              <div className="text-2xl font-bold text-black">{semesterCourses.length}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Classes This Week</div>
              <div className="text-2xl font-bold text-black">
                {weeklySchedule.reduce((sum, day) => sum + day.sessions.length, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Upcoming Events</div>
              <div className="text-2xl font-bold text-black">{upcomingEvents.length}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center italic">
            All course enrollments are managed by administration
          </div>
        </div>
      </div>
    </div>
  );
}
