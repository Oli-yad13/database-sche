import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeslotsService {
  constructor(private prisma: PrismaService) {}

  async findAll(day?: string) {
    const where: any = {};

    if (day) {
      where.days = {
        has: day,
      };
    }

    return this.prisma.timeSlot.findMany({
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

    return timeSlot;
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

    return this.prisma.timeSlot.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        duration,
      },
    });
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

    return this.prisma.timeSlot.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
        duration,
      },
    });
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
