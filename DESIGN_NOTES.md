# Project Design Notes & Ideas

This document tracks our brainstorming, feature ideas, and the evolving scope of the University Scheduling System.

## Core Concept
A "Batch Scheduling System" that allows administrators to automate the complex puzzle of assigning courses to rooms and time slots, while respecting constraints.

## Key Features

### 1. Automation Engine ("The Solver")
- **Goal**: Don't just record data; *generate* the schedule.
- **Input**:
    - Courses to be offered this semester.
    - Available Rooms (and their capacities).
    - Available Teachers.
- **Logic**:
    - Must match Room Capacity >= Section Size.
    - Must avoid Time Clashes (Same Room, Same Teacher, Same Student Batch).

### 2. Retake Handling (Student Fails)
- **Problem**: Students who fail a course (Grade F) must retake it. This adds unexpected load to a course.
- **Solution**:
    - "Demand Calculation" step before scheduling.
    - `Total Seats Needed = (Fresh Students) + (Retake Students)`.
    - If needed, the system should suggest opening an extra Section.

### 3. Constraints (The Rules)
- **Hard Constraints** (Must never break):
    - 1 Room = 1 Class at a time.
    - 1 Teacher = 1 Class at a time.
    - Prerequisites: Student cannot take `Adv. Java` without passing `Core Java`.
- **Soft Constraints** (Try to optimize):
    - Teachers prefer morning slots?
    - Minimize gaps for students? (Future)

## Database Schema Highlights
- `student_grades`: To track history (who passed, who failed).
- `prerequisites`: To enforce order of courses.
- `time_slots`: Standardized blocks (e.g., "Mon 08:30-10:00") to make the math easier.

## Open Questions / Future Ideas
- **Preferences**: Should teachers be able to submit "preferred times"?
- **Lab vs Lecture**: Do we need to handle different room types (Computer Lab vs Regular Classroom)?
- **Exam Scheduling**: Different from class scheduling, but uses similar data.
