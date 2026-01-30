# 📊 Schema Analysis & Missing Scenarios

## 🚨 Critical Missing Components

### 1. **Academic Structure** ❌
**Current Problem:** No way to track which program/major students belong to, or their year level.

**Missing:**
- ✅ Academic Years (in SQL but NOT in Prisma schema!)
- ❌ Programs/Majors (Computer Science, Software Engineering programs)
- ❌ Student Batches/Cohorts (Class of 2025, Batch 2023)
- ❌ Year Levels (Freshman=1, Sophomore=2, Junior=3, Senior=4)
- ❌ Curricula (different programs have different course requirements)

**Real Scenario:**
> "SE students in Year 3 need to take SE301, but CS students don't. How do we know who's in which program?"

---

### 2. **Course Session Types** ❌
**Current Problem:** No distinction between lecture, lab, and tutorial sessions.

**Missing:**
- ❌ Session Types (Lecture 3hrs + Lab 2hrs for one course)
- ❌ Multi-session courses (SE302 might need 2 lectures + 1 lab per week)
- ❌ Session groupings (Lab sections linked to lecture sections)

**Real Scenario:**
> "Database Systems (SE302) needs 2 lecture sessions (Mon/Wed) + 1 lab session (Fri). How do we model this?"

---

### 3. **Teacher Availability & Preferences** ❌
**Current Problem:** No way to specify when teachers are available or prefer to teach.

**Missing:**
- ❌ Teacher availability blocks ("Prof. Smith unavailable Fridays")
- ❌ Teaching preferences (morning vs afternoon)
- ❌ Maximum teaching load (max 12 credit hours per semester)
- ❌ Department assignments (primary and secondary)
- ❌ Office hours

**Real Scenario:**
> "Prof. Johnson only teaches on Mon/Wed and has a 9-credit max load. How do we enforce this?"

---

### 4. **Room Constraints** ❌
**Current Problem:** No room unavailability tracking or special requirements.

**Missing:**
- ❌ Room maintenance periods
- ❌ Room equipment (projector, computers, capacity for labs)
- ❌ Building/Location info (walking time between buildings)
- ❌ Special room types (conference rooms, exam halls)

**Real Scenario:**
> "Lab C101 is under maintenance Weeks 5-7. Computer labs need 30+ computers. How do we track this?"

---

### 5. **Enrollment Management** ❌
**Current Problem:** No waitlist, no enrollment periods, no holds.

**Missing:**
- ❌ Enrollment capacity tracking (current count vs max)
- ❌ Waitlist functionality
- ❌ Enrollment periods (registration opens/closes dates)
- ❌ Add/Drop deadlines
- ❌ Student holds (financial hold, academic probation)
- ❌ Registration priority (seniors register first)

**Real Scenario:**
> "SE301 is full (35/35). Student tries to enroll → should go to waitlist. Senior holds get cleared first."

---

### 6. **Schedule Conflicts** ❌
**Current Problem:** No conflict detection or logging.

**Missing:**
- ❌ Conflict detection engine
- ❌ Conflict types (teacher, room, student batch)
- ❌ Conflict resolution log
- ❌ Schedule validation before publishing

**Real Scenario:**
> "Prof. Smith assigned to SE101-A (Mon 8:30) and CS201-B (Mon 8:30) → CONFLICT! How do we detect?"

---

### 7. **Schedule Versioning** ❌
**Current Problem:** No draft vs published schedule separation.

**Missing:**
- ❌ Schedule status (draft, published, archived)
- ❌ Schedule versions (Fall 2025 v1, v2, v3)
- ❌ Change history/audit log
- ❌ Rollback capability

**Real Scenario:**
> "Admin is working on Fall 2025 schedule (draft). Students shouldn't see it until published."

---

### 8. **Prerequisites & Co-requisites** ⚠️
**Current Status:** Partially implemented (prerequisites exist, co-requisites don't)

**Missing:**
- ❌ Co-requisites (SE301 Data Structures + SE302 Algorithms must be taken together)
- ❌ Prerequisite alternatives (SE101 OR CS101)
- ❌ Prerequisite waivers/overrides
- ❌ Grade requirements (need B+ or higher in SE201 for SE301)

**Real Scenario:**
> "Student needs SE201 with grade B+ to take SE301, but got B. Needs advisor override."

---

### 9. **Student Academic Info** ❌
**Current Problem:** No tracking of student program, year, advisor.

**Missing:**
- ❌ Student program/major
- ❌ Student year level (1-4)
- ❌ Student batch/cohort
- ❌ Academic advisor assignment
- ❌ Academic standing (good standing, probation, honors)
- ❌ Total credits completed
- ❌ Expected graduation date

**Real Scenario:**
> "How do we know if a Year 2 student is trying to enroll in a Year 4 course?"

---

### 10. **Course Offerings** ❌
**Current Problem:** Assumes all courses offered every semester.

**Missing:**
- ❌ Course offering schedule (SE401 only offered in Fall)
- ❌ Course rotation (alternating semesters)
- ❌ Special topics courses
- ❌ Cross-listed courses (same course, different codes)

**Real Scenario:**
> "SE401 Senior Project only offered Fall semester. How do we prevent Spring sections?"

---

### 11. **Grading System** ⚠️
**Current Status:** Basic grades exist, but incomplete.

**Missing:**
- ❌ Grade scale definitions (A = 90-100, B = 80-89)
- ❌ GPA calculation
- ❌ Incomplete (I) grades with makeup deadlines
- ❌ Withdrawal (W) grades
- ❌ Pass/Fail options

---

### 12. **Authentication & Security** ❌
**Current Problem:** Passwords stored as plain text in seed script!

**Missing:**
- ❌ Proper password hashing (bcrypt)
- ❌ Refresh tokens (JWT expiry handling)
- ❌ Email verification
- ❌ Password reset flow
- ❌ Two-factor authentication (2FA)
- ❌ Session management
- ❌ Rate limiting
- ❌ Audit logs (who did what when)

---

### 13. **Retake & Repeat Logic** ⚠️
**Current Status:** Mentioned in design notes, not implemented.

**Missing:**
- ❌ Failed course tracking
- ❌ Retake limit enforcement (max 2 retakes)
- ❌ Retake demand calculation for scheduling
- ❌ GPA recalculation (replace F with new grade)

**Real Scenario:**
> "15 students failed SE201 last semester → need extra section this semester."

---

### 14. **Time Slot Flexibility** ⚠️
**Current Status:** Standardized slots exist, but rigid.

**Missing:**
- ❌ Custom time slots (guest lectures at odd times)
- ❌ Block scheduling (same course meets 2-3 times per week)
- ❌ Evening/weekend classes
- ❌ Online/hybrid class indicators

---

### 15. **Notifications & Communication** ❌
**Missing:**
- ❌ Schedule change notifications
- ❌ Enrollment confirmations
- ❌ Waitlist movement alerts
- ❌ Grade posting notifications
- ❌ Deadline reminders

---

### 16. **Reports & Analytics** ❌
**Missing:**
- ❌ Room utilization reports
- ❌ Teacher workload reports
- ❌ Enrollment statistics
- ❌ Conflict analysis
- ❌ Prerequisite violation reports

---

### 17. **Special Cases** ❌
**Missing:**
- ❌ Independent study courses
- ❌ Internships/Co-op
- ❌ Transfer students (credit evaluation)
- ❌ Exchange students
- ❌ Course substitutions
- ❌ Exam scheduling (separate from class scheduling)

---

## 📋 Prioritized Implementation Plan

### **Phase 1: Critical Foundations** (Week 1)
Must-haves for basic functionality:
- ✅ Add Academic Years to Prisma schema
- ✅ Add Programs/Majors
- ✅ Add Student extended info (program, year, batch)
- ✅ Add Section status (draft/published)
- ✅ Add Enrollment constraints (max capacity)
- ✅ **Proper Authentication System** (bcrypt, JWT, refresh tokens)

### **Phase 2: Scheduling Core** (Week 2)
Essential for auto-scheduling:
- ✅ Teacher availability
- ✅ Multi-session course support
- ✅ Conflict detection
- ✅ Room equipment tracking
- ✅ Schedule versioning

### **Phase 3: Business Logic** (Week 3)
Complex rules:
- ✅ Co-requisites
- ✅ Enrollment waitlist
- ✅ Registration periods
- ✅ Retake tracking
- ✅ Teaching load limits

### **Phase 4: Polish** (Week 4)
Nice-to-haves:
- ✅ Notifications
- ✅ Reports/Analytics
- ✅ Audit logs
- ✅ 2FA
- ✅ Special cases

---

## 🎯 Recommended Schema Additions

### Immediate (Next Migration):
```prisma
model AcademicYear { ... }
model Program { ... }
model StudentProfile { ... }
model TeacherProfile { ... }
model CourseSession { ... }
model ScheduleVersion { ... }
model Conflict { ... }
model EnrollmentWaitlist { ... }
model RefreshToken { ... }
```

### Near Future:
```prisma
model TeacherAvailability { ... }
model RoomEquipment { ... }
model EnrollmentPeriod { ... }
model Notification { ... }
model AuditLog { ... }
```

---

## 🔥 Top 5 Most Critical Additions

1. **Programs & Student Profiles** → Can't schedule without knowing who needs what
2. **Authentication Security** → Can't deploy with plain text passwords
3. **Schedule Status/Versioning** → Can't work on drafts without publishing
4. **Conflict Detection** → Core scheduling requirement
5. **Enrollment Capacity Tracking** → Prevent overselling sections

---

**Recommendation:** Let's start with Phase 1 enhancements + proper auth NOW.
