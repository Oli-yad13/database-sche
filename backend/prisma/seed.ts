import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users with proper passwords
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const teacherPasswordHash = await bcrypt.hash('Teacher123!', 12);
  const studentPasswordHash = await bcrypt.hash('Student123!', 12);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPasswordHash }, // Update password if user exists
    create: {
      username: 'admin',
      email: 'admin@university.edu',
      passwordHash: adminPasswordHash,
      role: Role.admin,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Created/Updated admin user:', admin.username);

  // Teacher user
  const teacher = await prisma.user.upsert({
    where: { username: 'prof.smith' },
    update: { passwordHash: teacherPasswordHash },
    create: {
      username: 'prof.smith',
      email: 'smith@university.edu',
      passwordHash: teacherPasswordHash,
      role: Role.teacher,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Created/Updated teacher user:', teacher.username);

  // Student user
  const student = await prisma.user.upsert({
    where: { username: 'john.doe' },
    update: { passwordHash: studentPasswordHash },
    create: {
      username: 'john.doe',
      email: 'john.doe@university.edu',
      passwordHash: studentPasswordHash,
      role: Role.student,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Created/Updated student user:', student.username);

  // Create departments
  const departments = [
    { code: 'SE', name: 'Software Engineering', faculty: 'Engineering' },
    { code: 'CS', name: 'Computer Science', faculty: 'Engineering' },
    { code: 'IT', name: 'Information Technology', faculty: 'Engineering' },
    { code: 'CE', name: 'Computer Engineering', faculty: 'Engineering' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    console.log('Created department:', dept.code);
  }

  // Create rooms
  const rooms = [
    { name: 'A101', building: 'Block A', floor: 1, capacity: 50, type: 'lecture', hasProjector: true },
    { name: 'A102', building: 'Block A', floor: 1, capacity: 40, type: 'lecture', hasProjector: true },
    { name: 'B201', building: 'Block B', floor: 2, capacity: 30, type: 'lab', hasProjector: true, hasComputers: true, computerCount: 30 },
    { name: 'B202', building: 'Block B', floor: 2, capacity: 25, type: 'lab', hasProjector: true, hasComputers: true, computerCount: 25 },
    { name: 'C301', building: 'Block C', floor: 3, capacity: 100, type: 'auditorium', hasProjector: true },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    });
    console.log('Created room:', room.name);
  }

  // Create time slots
  const timeSlots = [
    { code: 'TS1', startTime: '08:00', endTime: '09:30', days: ['Monday', 'Wednesday', 'Friday'], duration: 90 },
    { code: 'TS2', startTime: '09:45', endTime: '11:15', days: ['Monday', 'Wednesday', 'Friday'], duration: 90 },
    { code: 'TS3', startTime: '11:30', endTime: '13:00', days: ['Monday', 'Wednesday', 'Friday'], duration: 90 },
    { code: 'TS4', startTime: '14:00', endTime: '15:30', days: ['Tuesday', 'Thursday'], duration: 90 },
    { code: 'TS5', startTime: '15:45', endTime: '17:15', days: ['Tuesday', 'Thursday'], duration: 90 },
  ];

  for (const ts of timeSlots) {
    await prisma.timeSlot.upsert({
      where: { code: ts.code },
      update: {},
      create: ts,
    });
    console.log('Created time slot:', ts.code);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
