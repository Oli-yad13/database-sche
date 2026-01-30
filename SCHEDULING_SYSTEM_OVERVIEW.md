# University Scheduling System - Overview

## System Purpose
This is a **scheduling-focused system** designed to manage course assignments, classroom allocation, and timetable organization for a university. The system is NOT an academic management system - it focuses purely on scheduling operations.

## Core Roles & Responsibilities

### 1. Student Role
**Purpose:** View personal schedule and events

**Features:**
- View weekly schedule broken down by day
  - Course code and name
  - Time slots
  - Teacher/instructor name
  - Room number and location (building + floor)
- View semester-wide course list
  - All enrolled courses
  - Schedule patterns (Mon & Wed, etc.)
  - Room and building assignments
- View upcoming events and holidays
  - Exam periods
  - University breaks
  - Special events

**What Students CANNOT See:**
- ❌ GPA or grades
- ❌ Academic progress
- ❌ Credits or transcripts
- ❌ Assignment submissions

**Student Dashboard Sections:**
1. My Schedule (toggle: Weekly View / Semester View)
2. Upcoming Events & Holidays
3. Quick Information (course count, class count)

---

### 2. Teacher Role
**Purpose:** View teaching assignments and student distribution

**Features:**
- View weekly teaching schedule
  - What courses they teach
  - Which sections (A, B, C, etc.)
  - What year level students (Year 1, 2, 3, 4)
  - How many students in each class
  - Room assignments (building + floor)
- View all assigned courses
  - Course code and name
  - Year level they teach to
  - Number of enrolled students
  - Room locations
  - Schedule patterns
- View student distribution by year level

**What Teachers CANNOT Do:**
- ❌ Grade submissions
- ❌ Attendance tracking
- ❌ Student performance evaluation
- ❌ Curriculum planning

**Teacher Dashboard Sections:**
1. Teaching Overview (stats: courses, students, sessions, rooms)
2. Teaching Schedule (toggle: Weekly View / Course View)
3. Students by Year Level

---

### 3. Admin Role
**Purpose:** Manage all scheduling assignments and resolve conflicts

**Features:**
- **Assignment Management:**
  - Assign teachers to courses and sections
  - Assign courses to year levels
  - Assign rooms to sections
  - Assign students to sections
  - Create and manage sections

- **Conflict Detection:**
  - Room conflicts (double-booking)
  - Teacher conflicts (teaching two sections simultaneously)
  - Capacity conflicts (room too small)
  - Prerequisite violations

- **Resource Management:**
  - Manage rooms and buildings
  - Track room utilization
  - Manage time slots
  - Manage departments

- **Event Management:**
  - Create holidays
  - Schedule exam periods
  - Set break periods
  - Manage special events

**Admin Dashboard Sections:**
1. System Overview (students, teachers, courses, sections, rooms, conflicts)
2. Management Tools (tabs: Overview, Assignments, Conflicts)
3. Assignment Wizard (3-step: course → teacher → room)
4. Conflict Resolution Interface
5. Room Availability by Building

---

## Data Model

### Key Entities

#### Academic Structure
- **AcademicYear**: 2025/2026, start/end dates
- **Semester**: Fall, Spring, Summer with registration periods
- **Department**: CS, SE with buildings
- **Program**: BSSE, CS with degree types and year levels

#### Scheduling Core
- **Course**: SE301, CS201 with credit hours and type
- **Section**: SE301-A, CS201-B (specific instances of courses)
- **Room**: A101, Lab C101 with building, floor, capacity
- **TimeSlot**: Mon 08:30-10:00, Wed 14:00-15:30
- **CourseSession**: Links section to timeslot and room

#### People
- **User**: username, email, password, role (student/teacher/admin)
- **StudentProfile**: student ID, year level, program, batch
- **TeacherProfile**: employee ID, department, title, specialization

#### Events
- **Event**: holidays, exam periods, breaks, special events
  - Type: holiday, break, exam_period, registration, etc.
  - Affects schedule: yes/no
  - Semester-specific or university-wide

---

## Key Workflows

### 1. Admin Creates a Section
1. Select course (e.g., SE301 - Data Structures)
2. Assign teacher (e.g., Prof. Smith)
3. Assign room (e.g., A101, Building A, Floor 1)
4. Set time slots (e.g., Mon 08:30-10:00, Wed 08:30-10:00)
5. Set year level (e.g., Year 3)
6. System checks for conflicts
7. If no conflicts, section is created

### 2. System Detects Conflicts
**Room Conflict:**
- SE301-A and CS201-B both assigned to A101 at Mon 08:30
- Severity: High
- Resolution: Change room for one section

**Teacher Conflict:**
- Prof. Smith teaching SE301-A and SE401-B at Wed 10:15
- Severity: Critical
- Resolution: Reassign one section to another teacher

**Capacity Conflict:**
- Room B202 capacity: 30 students
- Enrollment: 35 students
- Severity: Medium
- Resolution: Move to larger room

### 3. Student Views Schedule
1. Login with student credentials
2. See weekly breakdown:
   - Monday: SE301 at 08:30 in A101 (Building A, Floor 1) with Prof. Smith
   - Monday: CS201 at 10:15 in B202 (Building B, Floor 2) with Prof. Johnson
3. Toggle to semester view to see all courses at once
4. Check upcoming events (exam periods, holidays)

### 4. Teacher Views Assignments
1. Login with teacher credentials
2. See teaching overview:
   - 3 courses, 90 total students, 6 sessions/week, 2 classrooms
3. View weekly schedule:
   - What they teach each day
   - Which year levels
   - Which rooms
4. View breakdown by year level

---

## Database Schema Highlights

### Relationships
```
Department → Courses
Department → Teachers
Program → Students
Course → Sections
Section → CourseSession
CourseSession → Room, TimeSlot
Section → Teacher (User)
Section → Enrollments → Students (User)
Event → Semester (optional)
Event → Department (optional)
```

### Critical Fields

**Room:**
- `name`: A101
- `building`: Building A
- `floor`: 1
- `capacity`: 40
- `type`: lecture/lab/seminar/auditorium

**Section:**
- `name`: A, B, C
- `courseId`: SE301
- `semesterId`: Fall 2025
- `teacherId`: Prof. Smith
- `roomId`: A101
- `maxCapacity`: 40
- `status`: draft/published/open/closed

**Event:**
- `title`: Midterm Exams
- `eventType`: exam_period/holiday/break
- `startDate`, `endDate`
- `affectsSchedule`: true/false
- `semesterId`: optional (semester-specific)

---

## UI Design - Swiss Style

### Design Principles
- **Monochromatic**: Black, white, gray only
- **Grid-based layouts**: 1px gaps, 8px spacing
- **Typography**: Bold headings (36-48px), uppercase labels
- **Numbered sections**: 01. Schedule, 02. Events, etc.
- **Minimal effects**: No shadows, no gradients
- **Icons**: Lucide React icon library
- **Hover states**: White → Black inversions

### Color Palette
- Black: #0A0A0A
- White: #FFFFFF
- Gray: 50-900 scale

---

## API Structure (Backend)

The backend is built with NestJS and uses:
- Prisma ORM for database
- PostgreSQL database
- JWT authentication
- Role-based access control

### Key Endpoints (to be implemented):
```
POST   /auth/login
GET    /auth/profile

GET    /schedules/student/:id
GET    /schedules/teacher/:id
GET    /sections
GET    /sections/:id
POST   /sections
PATCH  /sections/:id
DELETE /sections/:id

GET    /assignments
POST   /assignments/teacher
POST   /assignments/room
POST   /assignments/student

GET    /conflicts
POST   /conflicts/check
PATCH  /conflicts/:id/resolve

GET    /events
POST   /events
PATCH  /events/:id
DELETE /events/:id

GET    /rooms
GET    /rooms/availability
```

---

## Next Steps for Development

1. **Backend API Development:**
   - Implement section management endpoints
   - Implement assignment endpoints
   - Implement conflict detection algorithm
   - Implement event management
   - Create schedule retrieval endpoints

2. **Frontend Integration:**
   - Connect dashboards to real APIs
   - Replace mock data with API calls
   - Add loading states
   - Add error handling

3. **Advanced Features:**
   - Automatic schedule optimization
   - Room recommendation based on capacity
   - Time slot suggestions to avoid conflicts
   - Bulk assignment operations
   - Schedule export (PDF, ICS calendar)

4. **Admin Tools:**
   - Complete assignment wizard functionality
   - Conflict resolution workflows
   - Batch operations for enrollments
   - Schedule versioning and history

---

## Login Credentials (Development)

### Admin
- Username: `admin`
- Password: `password123`
- Access: Full scheduling management

### Teacher
- Username: `prof.smith`
- Password: `password123`
- Access: View own teaching assignments

### Student
- Username: `john.doe`
- Password: `password123`
- Access: View own schedule

---

## File Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema with Event model
│   ├── seed.ts                # Sample data
│   └── migrations/
├── src/
│   ├── auth/                  # Authentication module
│   ├── prisma/                # Prisma service
│   └── main.ts

frontend/
├── app/
│   ├── student/page.tsx       # Student schedule view
│   ├── teacher/page.tsx       # Teacher assignments view
│   ├── admin/page.tsx         # Admin scheduling management
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── page.tsx               # Landing page
├── contexts/
│   └── AuthContext.tsx        # Auth state management
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   └── auth.ts
│   └── design-system.ts       # Swiss design config
└── components/                # Reusable components
```

---

## Summary

This is a **pure scheduling system** where:
- **Students** see their schedule by year (courses, times, rooms, floors, teachers, events)
- **Teachers** see what they teach, to which years, in which rooms
- **Admins** assign teachers to courses, students to sections, and courses to rooms/floors

**No grades, no GPA, no academic tracking** - only scheduling!
