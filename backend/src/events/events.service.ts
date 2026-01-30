import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        title: string;
        description?: string;
        eventType: string;
        startDate: string | Date;
        endDate: string | Date;
        isAllDay?: boolean;
        affectsSchedule?: boolean;
    }) {
        return this.prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                eventType: data.eventType,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                isAllDay: data.isAllDay ?? false,
                affectsSchedule: data.affectsSchedule ?? false,
            },
        });
    }

    async findAll() {
        return this.prisma.event.findMany({
            orderBy: {
                startDate: 'asc',
            },
        });
    }

    async findOne(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        return event;
    }

    async remove(id: number) {
        // Check if exists
        await this.findOne(id);

        return this.prisma.event.delete({
            where: { id },
        });
    }

    async update(id: number, data: {
        title?: string;
        description?: string;
        eventType?: string;
        startDate?: string | Date;
        endDate?: string | Date;
        isAllDay?: boolean;
        affectsSchedule?: boolean;
    }) {
        await this.findOne(id); // Ensure exists

        return this.prisma.event.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }
}
