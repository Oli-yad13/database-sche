import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) { }

  async findAll(search?: string) {
    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { code: { contains: search, mode: 'insensitive' as any } },
        ],
      }
      : {};

    return this.prisma.department.findMany({
      where,
      include: {
        _count: {
          select: {
            courses: true,
            sections: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        courses: true,
        sections: true,
        _count: {
          select: {
            courses: true,
            sections: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async create(data: {
    name: string;
    code: string;
    description?: string;
    faculty?: string;
    headOfDepartment?: string;
    headEmail?: string;
  }) {
    try {
      return await this.prisma.department.create({
        data: {
          ...data,
          code: data.code.toUpperCase(),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Department with code "${data.code.toUpperCase()}" already exists`);
      }
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
      faculty?: string;
      headOfDepartment?: string;
      headEmail?: string;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id); // Check if exists

    return this.prisma.department.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
      },
    });
  }

  async delete(id: number) {
    await this.findOne(id); // Check if exists

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
