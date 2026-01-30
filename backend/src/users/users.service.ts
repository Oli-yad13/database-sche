
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    private readonly SALT_ROUNDS = 12;

    async findAll(search?: string, role?: Role) {
        const where: any = {};

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' as any } },
                { email: { contains: search, mode: 'insensitive' as any } },
            ];
        }

        if (role) {
            where.role = role;
        }

        return this.prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                lastLogin: true,
            },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async create(data: {
        username: string;
        email: string;
        password?: string; // Optional, can generate if not provided
        role: Role;
        isActive?: boolean;
        isVerified?: boolean;
    }) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: data.username }, { email: data.email }],
            },
        });

        if (existingUser) {
            if (existingUser.username === data.username) {
                throw new ConflictException('Username already taken');
            }
            throw new ConflictException('Email already registered');
        }

        // Hash password (default to 'Password123!' if not provided - insecure but fine for demo/admin creation logic needing refinement later)
        const rawPassword = data.password || 'Password123!';
        const passwordHash = await bcrypt.hash(rawPassword, this.SALT_ROUNDS);

        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                role: data.role,
                isActive: data.isActive ?? true,
                isVerified: data.isVerified ?? true, // Admin created users usually verified
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
            },
        });

        return user;
    }

    async update(
        id: number,
        data: {
            username?: string;
            email?: string;
            password?: string;
            role?: Role;
            isActive?: boolean;
            isVerified?: boolean;
        },
    ) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        const updateData: any = { ...data };

        // Hash new password if provided
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);
            delete updateData.password;
        }

        // Check conflicts if updating username/email
        if (data.username || data.email) {
            const conflict = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        data.username ? { username: data.username } : undefined,
                        data.email ? { email: data.email } : undefined,
                    ].filter(Boolean) as any,
                    NOT: { id },
                },
            });

            if (conflict) {
                throw new ConflictException('Username or email already in use');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async delete(id: number) {
        await this.findOne(id); // Check existence

        // TODO: Check dependencies (e.g., if teacher has schedules)
        // For now, rely on foreign key constraints or assume cascade/restrict

        // Check if teacher has schedules
        const schedules = await this.prisma.schedule.count({
            where: { teacherId: id }
        });
        if (schedules > 0) {
            throw new ConflictException(`Cannot delete user. They are assigned to ${schedules} schedule(s) as a teacher.`);
        }

        return this.prisma.user.delete({
            where: { id },
        });
    }
}
