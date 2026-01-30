'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

interface TeacherSession {
  time: string;
  course: string;
  courseName: string;
  section: string;
  room: string;
  building: string;
  floor: number;
  students: number;
  yearLevel: number;
}

interface TeacherDaySchedule {
  day: string;
  sessions: TeacherSession[];
}

interface AssignedCourse {
  code: string;
  name: string;
  section: string;
  sections: string[];
  schedule: string;
  room: string;
  building: string;
  floor: number;
  students: number;
  yearLevel: number;
  sessionsPerWeek: number;
}

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'week' | 'courses'>('week');

  // Data will be fetched from API
  const teacherInfo = {
    employeeId: '',
    title: '',
    department: '',
    semester: '',
  };

  const weeklySchedule: TeacherDaySchedule[] = [];
  const assignedCourses: AssignedCourse[] = [];

  // Summary stats
  const totalSessions = weeklySchedule.reduce((sum, day) => sum + day.sessions.length, 0);
  const totalStudents = assignedCourses.reduce((sum, course) => sum + course.students, 0);
  const uniqueRooms = new Set(assignedCourses.map(c => c.room)).size;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Teacher Schedule
        </div>
        <h1 className="text-4xl font-bold text-black mb-2">
          {teacherInfo.title} {user?.username}
        </h1>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div>{teacherInfo.employeeId}</div>
          <div>•</div>
          <div>{teacherInfo.department}</div>
          <div>•</div>
          <div>{teacherInfo.semester}</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. Teaching Overview
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-gray-200 p-1">
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <BookOpen className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">{assignedCourses.length}</div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <Users className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">{totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <Calendar className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">{totalSessions}</div>
            <div className="text-sm text-gray-600">Sessions/Week</div>
          </div>
          <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
            <MapPin className="h-6 w-6 text-black mb-4" />
            <div className="text-4xl font-bold text-black mb-2">{uniqueRooms}</div>
            <div className="text-sm text-gray-600">Classrooms</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Teaching Schedule
        </div>
        <div className="grid grid-cols-2 gap-1 bg-gray-200 p-1 max-w-md">
          <button
            onClick={() => setSelectedView('week')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              selectedView === 'week'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setSelectedView('courses')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              selectedView === 'courses'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            Course View
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
                className={`${
                  dayIndex !== weeklySchedule.length - 1 ? 'border-b border-gray-200' : ''
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
                        className={`p-6 hover:bg-gray-50 transition-colors ${
                          sessionIndex !== day.sessions.length - 1
                            ? 'border-b border-gray-200'
                            : ''
                        }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Time & Course */}
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Clock className="h-3 w-3" />
                              {session.time}
                            </div>
                            <div className="text-xl font-bold text-black mb-1">
                              {session.course} - {session.section}
                            </div>
                            <div className="text-sm text-gray-600">
                              {session.courseName}
                            </div>
                          </div>

                          {/* Year & Students */}
                          <div>
                            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                              Class Info
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-black">
                                <GraduationCap className="h-4 w-4" />
                                Year {session.yearLevel}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                {session.students} students
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="lg:col-span-2">
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

      {/* Course View */}
      {selectedView === 'courses' && (
        <div className="grid md:grid-cols-2 gap-1 bg-gray-200 p-1">
          {assignedCourses.map((course, index) => (
            <div key={index} className="bg-white p-8 hover:bg-gray-50 transition-colors">
              <div className="text-xl font-bold text-black mb-1">
                {course.code} - {course.section}
              </div>
              <div className="text-sm text-gray-600 mb-6">{course.name}</div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Year Level
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black">
                      <GraduationCap className="h-4 w-4" />
                      Year {course.yearLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Enrolled
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Users className="h-4 w-4" />
                      {course.students} students
                    </div>
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
                  <div className="text-xs text-gray-500 mt-1">
                    {course.sessionsPerWeek} sessions per week
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
                Course assignments managed by administration
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Year Level Breakdown */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          03. Students by Year Level
        </div>
        <div className="border border-gray-200 p-6">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { year: 1, count: 0 },
              { year: 2, count: 30 },
              { year: 3, count: 32 },
              { year: 4, count: 28 },
            ].map((item) => (
              <div key={item.year}>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <GraduationCap className="h-4 w-4" />
                  Year {item.year}
                </div>
                <div className="text-3xl font-bold text-black">{item.count}</div>
                <div className="text-xs text-gray-400 mt-1">students</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
