import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) { }

  async findAll(departmentId?: number, level?: number) {
    const where: any = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (level) {
      where.level = level;
    }

    return this.prisma.course.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: [
        { code: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        schedules: {
          include: {
            teacher: true,
            room: true,
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

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async create(data: {
    code: string;
    name: string;
    description?: string;
    departmentId: number;
    creditHours: number;
    level: number;
    hasLab?: boolean;
  }) {
    // Validate department exists
    const department = await this.prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${data.departmentId} not found`);
    }

    // Validate level
    if (data.level < 100 || data.level > 400 || data.level % 100 !== 0) {
      throw new BadRequestException('Level must be 100, 200, 300, or 400');
    }

    // Validate credit hours
    if (data.creditHours < 1 || data.creditHours > 6) {
      throw new BadRequestException('Credit hours must be between 1 and 6');
    }

    try {
      return await this.prisma.course.create({
        data: {
          ...data,
          code: data.code.toUpperCase(),
        },
        include: {
          department: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Course with code "${data.code.toUpperCase()}" already exists`);
      }
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      code?: string;
      name?: string;
      description?: string;
      creditHours?: number;
      level?: number;
      hasLab?: boolean;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id); // Check if exists

    // Validate level if provided
    if (data.level && (data.level < 100 || data.level > 400 || data.level % 100 !== 0)) {
      throw new BadRequestException('Level must be 100, 200, 300, or 400');
    }

    // Validate credit hours if provided
    if (data.creditHours && (data.creditHours < 1 || data.creditHours > 6)) {
      throw new BadRequestException('Credit hours must be between 1 and 6');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
      },
      include: {
        department: true,
      },
    });
  }

  async delete(id: number) {
    await this.findOne(id); // Check if exists

    // Check if course is being used
    const schedules = await this.prisma.schedule.count({
      where: { courseId: id },
    });

    if (schedules > 0) {
      throw new BadRequestException(
        `Cannot delete course. It is being used by ${schedules} schedule(s)`,
      );
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
