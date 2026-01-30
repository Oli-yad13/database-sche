// scheduler.js - The Automation Engine

// This generic class outlines how we will approach the "Batch Scheduling" problem.
// It uses a heuristic approach: simplified "Greedy" placement with backtracking capabilities if needed.

class Scheduler {
    constructor(dbPool) {
        this.pool = dbPool;
    }

    /**
     * Main entry point to generate a schedule for a specific Semester.
     * @param {number} semesterId 
     */
    async generateSchedule(semesterId) {
        console.log(`Starting scheduling for Semester ${semesterId}...`);

        // 1. Fetch all Sections that need scheduling
        const sections = await this.getUnscheduledSections(semesterId);

        // 2. Fetch all Resources
        const rooms = await this.getRooms();
        const timeSlots = await this.getTimeSlots();

        // 3. Sort sections by constraint difficulty (e.g. largest Enrollment first)
        //    This is a common heuristic: schedule the hardest things first.
        sections.sort((a, b) => b.max_capacity - a.max_capacity);

        const scheduleMap = []; // Stores the successful assignments
        const errors = [];

        // 4. Iterate and Assign
        for (const section of sections) {
            const assignment = this.findSlotForSection(section, rooms, timeSlots, scheduleMap);

            if (assignment) {
                scheduleMap.push(assignment);
                // Ideally, we'd save to DB here or in bulk at the end
                console.log(`Scheduled ${section.name} in Room ${assignment.roomId} at Slot ${assignment.timeSlotId}`);
            } else {
                console.error(`FAILED to schedule Section ${section.id} (${section.name}) - No valid slot found.`);
                errors.push(section);
            }
        }

        // 5. Commit Results
        await this.saveSchedule(scheduleMap);

        return {
            success: errors.length === 0,
            scheduled: scheduleMap.length,
            failed: errors.length,
            errors: errors
        };
    }

    /**
     * Tries to find a valid (Room, Time) tuple for a Section.
     */
    findSlotForSection(section, rooms, timeSlots, currentSchedule) {
        // Try every time slot
        for (const slot of timeSlots) {
            // Try every room
            for (const room of rooms) {
                // CONSTRAINT 1: Room Capacity
                if (room.capacity < section.max_capacity) continue;

                // CONSTRAINT 2: Room is free at this time
                if (this.isRoomBusy(room.id, slot.id, currentSchedule)) continue;

                // CONSTRAINT 3: Teacher is free at this time
                if (this.isTeacherBusy(section.teacher_id, slot.id, currentSchedule)) continue;

                // If we survived all checks, it's a match!
                return {
                    sectionId: section.id,
                    roomId: room.id,
                    timeSlotId: slot.id,
                    teacherId: section.teacher_id
                };
            }
        }
        return null; // Impossible to schedule with current resources
    }

    isRoomBusy(roomId, timeSlotId, schedule) {
        return schedule.some(s => s.roomId === roomId && s.timeSlotId === timeSlotId);
    }

    isTeacherBusy(teacherId, timeSlotId, schedule) {
        if (!teacherId) return false; // TBD section
        return schedule.some(s => s.teacherId === teacherId && s.timeSlotId === timeSlotId);
    }

    // --- Mock DB Helpers (Implement with real SQL later) ---
    async getUnscheduledSections(semesterId) {
        // SELECT * FROM sections WHERE semester_id = $1 AND room_id IS NULL
        return [];
    }

    async getRooms() {
        // SELECT * FROM rooms
        return [];
    }

    async getTimeSlots() {
        // SELECT * FROM time_slots
        return [];
    }

    async saveSchedule(assignments) {
        // UPDATE sections SET room_id = ..., time_slot_id = ...
    }
}

module.exports = Scheduler;
