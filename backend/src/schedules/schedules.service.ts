import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        sectionId: number;
        courseId: number;
        teacherId?: number;
        roomId: number;
        timeSlotId: number;
        semesterId?: number;
    }) {
        // Check for conflicts
        const conflicts = await this.checkConflicts(data);
        if (conflicts.length > 0) {
            throw new ConflictException({
                message: 'Schedule conflict detected',
                conflicts,
            });
        }

        const schedule = await this.prisma.schedule.create({
            data,
            include: {
                course: true,
                teacher: true,
                room: true,
                timeSlot: true,
            },
        });

        return {
            ...schedule,
            timeSlot: {
                ...schedule.timeSlot,
                days: JSON.parse(schedule.timeSlot.days),
            },
        };
    }

    async findAll(filters?: {
        sectionId?: number;
        courseId?: number;
        teacherId?: number;
        roomId?: number;
    }) {
        const schedules = await this.prisma.schedule.findMany({
            where: {
                ...(filters?.sectionId && { sectionId: filters.sectionId }),
                ...(filters?.courseId && { courseId: filters.courseId }),
                ...(filters?.teacherId && { teacherId: filters.teacherId }),
                ...(filters?.roomId && { roomId: filters.roomId }),
            },
            include: {
                course: true,
                teacher: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                room: true,
                timeSlot: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return schedules.map(schedule => ({
            ...schedule,
            timeSlot: schedule.timeSlot ? {
                ...schedule.timeSlot,
                days: JSON.parse(schedule.timeSlot.days),
            } : null,
        }));
    }

    async findOne(id: number) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
            include: {
                course: true,
                teacher: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                room: true,
                timeSlot: true,
            },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }

        return {
            ...schedule,
            timeSlot: schedule.timeSlot ? {
                ...schedule.timeSlot,
                days: JSON.parse(schedule.timeSlot.days),
            } : null,
        };
    }

    async update(id: number, data: {
        sectionId?: number;
        courseId?: number;
        teacherId?: number;
        roomId?: number;
        timeSlotId?: number;
        semesterId?: number;
    }) {
        await this.findOne(id);

        // Check for conflicts if changing time/room
        if (data.timeSlotId || data.roomId) {
            const current = await this.prisma.schedule.findUnique({ where: { id } });
            const checkData = {
                sectionId: data.sectionId ?? current!.sectionId,
                courseId: data.courseId ?? current!.courseId,
                roomId: data.roomId ?? current!.roomId,
                timeSlotId: data.timeSlotId ?? current!.timeSlotId,
            };
            const conflicts = await this.checkConflicts(checkData, id);
            if (conflicts.length > 0) {
                throw new ConflictException({
                    message: 'Schedule conflict detected',
                    conflicts,
                });
            }
        }

        const schedule = await this.prisma.schedule.update({
            where: { id },
            data,
            include: {
                course: true,
                teacher: true,
                room: true,
                timeSlot: true,
            },
        });

        return {
            ...schedule,
            timeSlot: schedule.timeSlot ? {
                ...schedule.timeSlot,
                days: JSON.parse(schedule.timeSlot.days),
            } : null,
        };
    }

    async remove(id: number) {
        await this.findOne(id);
        const schedule = await this.prisma.schedule.delete({
            where: { id },
            include: { timeSlot: true } // Need to separate delete from response transformation? No, simple delete return is fine, but if I want to return the object I should.
        });
        // Simple delete doesn't need detailed return usually, but let's be safe.
        return schedule; // Skipping transformation for remove as it's rarely used for display immediately
    }

    async checkConflicts(data: {
        sectionId?: number;
        courseId?: number;
        roomId: number;
        timeSlotId: number;
    }, excludeId?: number) {
        const conflicts: string[] = [];

        // Check room conflict: same room, same time slot
        const roomConflict = await this.prisma.schedule.findFirst({
            where: {
                roomId: data.roomId,
                timeSlotId: data.timeSlotId,
                ...(excludeId && { id: { not: excludeId } }),
            },
            include: {
                course: true,
                room: true,
                timeSlot: true,
            },
        });

        if (roomConflict) {
            conflicts.push(
                `Room ${roomConflict.room.name} is already booked for ${roomConflict.course.code} at this time slot`
            );
        }

        // Check section conflict: same section, same time slot (different course)
        if (data.sectionId) {
            const sectionConflict = await this.prisma.schedule.findFirst({
                where: {
                    sectionId: data.sectionId,
                    timeSlotId: data.timeSlotId,
                    ...(excludeId && { id: { not: excludeId } }),
                },
                include: {
                    course: true,
                    timeSlot: true,
                },
            });

            if (sectionConflict) {
                conflicts.push(
                    `Section already has ${sectionConflict.course.code} scheduled at this time slot`
                );
            }
        }

        return conflicts;
    }

    async validateAssignment(data: {
        sectionId: number;
        roomId: number;
        timeSlotId: number;
    }) {
        // Get section capacity
        const section = await this.prisma.section.findUnique({
            where: { id: data.sectionId },
        });

        // Get room capacity
        const room = await this.prisma.room.findUnique({
            where: { id: data.roomId },
        });

        if (!section || !room) {
            return { valid: false, message: 'Section or room not found' };
        }

        // Check capacity
        if (section.capacity > room.capacity) {
            return {
                valid: false,
                message: `Capacity conflict: Section has ${section.capacity} students but room only fits ${room.capacity}`,
            };
        }

        // Check conflicts
        const conflicts = await this.checkConflicts(data);
        if (conflicts.length > 0) {
            return { valid: false, message: conflicts.join('; ') };
        }

        return { valid: true, message: 'No conflicts detected' };
    }
}
