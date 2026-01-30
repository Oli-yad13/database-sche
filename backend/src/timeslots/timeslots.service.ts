import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeslotsService {
  constructor(private prisma: PrismaService) { }

  async findAll(day?: string) {
    const where: any = {};

    if (day) {
      where.days = {
        contains: day,
      };
    }

    const timeSlots = await this.prisma.timeSlot.findMany({
      where,
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: [
        { startTime: 'asc' },
      ],
    });

    return timeSlots.map(ts => ({
      ...ts,
      days: JSON.parse(ts.days) as string[],
    }));
  }

  async findOne(id: number) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            course: true,
            teacher: true,
            room: true,
          },
        },
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    if (!timeSlot) {
      throw new NotFoundException(`TimeSlot with ID ${id} not found`);
    }

    return {
      ...timeSlot,
      days: JSON.parse(timeSlot.days) as string[],
    };
  }

  async create(data: {
    code: string;
    startTime: string;
    endTime: string;
    days: string[];
  }) {
    // Calculate duration in minutes
    const start = this.timeToMinutes(data.startTime);
    const end = this.timeToMinutes(data.endTime);
    const duration = end - start;

    if (duration <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    const created = await this.prisma.timeSlot.create({
      data: {
        ...data,
        days: JSON.stringify(data.days),
        code: data.code.toUpperCase(),
        duration,
      },
    });

    return {
      ...created,
      days: JSON.parse(created.days) as string[],
    };
  }

  async update(
    id: number,
    data: {
      code?: string;
      startTime?: string;
      endTime?: string;
      days?: string[];
      isActive?: boolean;
    },
  ) {
    await this.findOne(id); // Check if exists

    let duration: number | undefined;
    if (data.startTime && data.endTime) {
      const start = this.timeToMinutes(data.startTime);
      const end = this.timeToMinutes(data.endTime);
      duration = end - start;

      if (duration <= 0) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const updated = await this.prisma.timeSlot.update({
      where: { id },
      data: {
        ...data,
        days: data.days ? JSON.stringify(data.days) : undefined,
        code: data.code ? data.code.toUpperCase() : undefined,
        duration,
      },
    });

    return {
      ...updated,
      days: JSON.parse(updated.days) as string[],
    };
  }

  async delete(id: number) {
    await this.findOne(id); // Check if exists

    // Check if timeslot is being used
    const schedules = await this.prisma.schedule.count({
      where: { timeSlotId: id },
    });

    if (schedules > 0) {
      throw new BadRequestException(
        `Cannot delete time slot. It is being used by ${schedules} schedule(s)`,
      );
    }

    return this.prisma.timeSlot.delete({
      where: { id },
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
