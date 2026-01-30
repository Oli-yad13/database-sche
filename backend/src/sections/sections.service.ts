import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: number, yearLevel?: number) {
    const where: any = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (yearLevel) {
      where.yearLevel = yearLevel;
    }

    return this.prisma.section.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { yearLevel: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        department: true,
        enrollments: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async create(data: {
    name: string;
    code: string;
    departmentId: number;
    yearLevel: number;
    capacity: number;
    advisor?: string;
    description?: string;
  }) {
    // Validate department exists
    const department = await this.prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${data.departmentId} not found`);
    }

    // Validate year level
    if (data.yearLevel < 1 || data.yearLevel > 4) {
      throw new BadRequestException('Year level must be between 1 and 4');
    }

    return this.prisma.section.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
      include: {
        department: true,
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      code?: string;
      capacity?: number;
      advisor?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id); // Check if exists

    return this.prisma.section.update({
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

    // Check if section has enrollments
    const enrollments = await this.prisma.enrollment.count({
      where: { sectionId: id },
    });

    if (enrollments > 0) {
      throw new BadRequestException(
        `Cannot delete section. It has ${enrollments} enrolled student(s)`,
      );
    }

    // Check if section has schedules
    const schedules = await this.prisma.schedule.count({
      where: { sectionId: id },
    });

    if (schedules > 0) {
      throw new BadRequestException(
        `Cannot delete section. It has ${schedules} schedule assignment(s)`,
      );
    }

    return this.prisma.section.delete({
      where: { id },
    });
  }
}
