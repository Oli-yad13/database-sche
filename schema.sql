-- University Scheduling System Schema

-- Users & Roles
-- Roles: 'admin', 'teacher', 'student'
CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs / Departments (e.g., Software Engineering)
CREATE TABLE departments (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

-- Courses (The Catalog)
CREATE TABLE courses (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    department_id INTEGER REFERENCES departments(id),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'SE101'
    name VARCHAR(200) NOT NULL,
    credit_hours INTEGER NOT NULL,
    default_semester INTEGER, -- 1-8, suggested semester in curriculum
    description TEXT
);

-- Prerequisites (Course X requires Course Y)
CREATE TABLE prerequisites (
    course_id INTEGER REFERENCES courses(id),
    prerequisite_id INTEGER REFERENCES courses(id),
    PRIMARY KEY (course_id, prerequisite_id)
);

-- Resources: Rooms
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL, -- e.g. 'B101'
    capacity INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'lecture' -- 'lecture', 'lab'
);

-- Resources: Time Slots (Standardized)
-- e.g., ID 1 = "Monday 08:30 - 10:00"
CREATE TABLE time_slots (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (day_of_week, start_time) -- Prevent duplicate slots
);

-- Academic Cycle
CREATE TABLE academic_years (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(20) NOT NULL, -- e.g., '2025/26'
    start_date DATE,
    end_date DATE
);

CREATE TABLE semesters (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    academic_year_id INTEGER REFERENCES academic_years(id),
    name VARCHAR(20) NOT NULL, -- 'Semester 1', 'Semester 2'
    start_date DATE,
    end_date DATE
);

-- Sections (The actual classes happening this semester)
CREATE TABLE sections (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id INTEGER REFERENCES courses(id),
    semester_id INTEGER REFERENCES semesters(id),
    teacher_id INTEGER REFERENCES users(id), -- User with role 'teacher'
    name VARCHAR(10), -- 'A', 'B', 'C' (Section A)
    max_capacity INTEGER NOT NULL,
    
    -- The Scheduled Assignment (Can be NULL initially, filled by Scheduler)
    room_id INTEGER REFERENCES rooms(id),
    time_slot_id INTEGER REFERENCES time_slots(id),
    
    UNIQUE (semester_id, course_id, name)
);

-- Enrollment
CREATE TABLE student_enrollments (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id INTEGER REFERENCES users(id),
    section_id INTEGER REFERENCES sections(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'enrolled' -- 'enrolled', 'dropped', 'completed'
);

-- Grading / History (For Prerequisites & Retakes)
CREATE TABLE student_grades (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    semester_id INTEGER REFERENCES semesters(id),
    grade VARCHAR(2), -- 'A', 'B', 'F', etc.
    passed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_sections_semester ON sections(semester_id);
CREATE INDEX idx_courses_dept ON courses(department_id);
CREATE INDEX idx_enrollments_student ON student_enrollments(student_id);
