import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) { }

  async findAll(building?: string, type?: string) {
    const where: any = {};

    if (building) {
      where.building = building;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.room.findMany({
      where,
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            course: true,
            teacher: true,
            timeSlot: true,
          },
        },
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async create(data: {
    name: string;
    building: string;
    floor: number;
    capacity: number;
    type: string;
    hasProjector?: boolean;
    hasComputers?: boolean;
    computerCount?: number;
  }) {
    try {
      return await this.prisma.room.create({
        data: {
          ...data,
          name: data.name.toUpperCase(),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Room "${data.name.toUpperCase()}" already exists`);
      }
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      name?: string;
      building?: string;
      floor?: number;
      capacity?: number;
      type?: string;
      hasProjector?: boolean;
      hasComputers?: boolean;
      computerCount?: number;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id); // Check if exists

    return this.prisma.room.update({
      where: { id },
      data: {
        ...data,
        name: data.name ? data.name.toUpperCase() : undefined,
      },
    });
  }

  async delete(id: number) {
    await this.findOne(id); // Check if exists

    // Check if room is being used
    const schedules = await this.prisma.schedule.count({
      where: { roomId: id },
    });

    if (schedules > 0) {
      throw new BadRequestException(
        `Cannot delete room. It is being used by ${schedules} schedule(s)`,
      );
    }

    return this.prisma.room.delete({
      where: { id },
    });
  }
}
