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
    { code: 'TS1', startTime: '08:00', endTime: '09:30', days: JSON.stringify(['Monday', 'Wednesday', 'Friday']), duration: 90 },
    { code: 'TS2', startTime: '09:45', endTime: '11:15', days: JSON.stringify(['Monday', 'Wednesday', 'Friday']), duration: 90 },
    { code: 'TS3', startTime: '11:30', endTime: '13:00', days: JSON.stringify(['Monday', 'Wednesday', 'Friday']), duration: 90 },
    { code: 'TS4', startTime: '14:00', endTime: '15:30', days: JSON.stringify(['Tuesday', 'Thursday']), duration: 90 },
    { code: 'TS5', startTime: '15:45', endTime: '17:15', days: JSON.stringify(['Tuesday', 'Thursday']), duration: 90 },
  ];

  for (const ts of timeSlots) {
    await prisma.timeSlot.upsert({
      where: { code: ts.code },
      update: {},
      create: ts as any, // Type assertion needed because SQLite stores days as JSON string
    });
    console.log('Created time slot:', ts.code);
  }

  // Get department references
  const seDept = await prisma.department.findUnique({ where: { code: 'SE' } });
  const csDept = await prisma.department.findUnique({ where: { code: 'CS' } });

  if (!seDept || !csDept) {
    throw new Error('Departments not found');
  }

  // Create courses
  const courses = [
    { code: 'SE101', name: 'Introduction to Programming', departmentId: seDept.id, creditHours: 3, level: 100, hasLab: true },
    { code: 'SE102', name: 'Computer Fundamentals', departmentId: seDept.id, creditHours: 3, level: 100, hasLab: false },
    { code: 'SE103', name: 'Discrete Mathematics', departmentId: seDept.id, creditHours: 3, level: 100, hasLab: false },
    { code: 'SE104', name: 'Technical Writing', departmentId: seDept.id, creditHours: 2, level: 100, hasLab: false },
    { code: 'SE201', name: 'Data Structures', departmentId: seDept.id, creditHours: 3, level: 200, hasLab: true },
    { code: 'SE202', name: 'Object Oriented Programming', departmentId: seDept.id, creditHours: 3, level: 200, hasLab: true },
    { code: 'CS101', name: 'Introduction to CS', departmentId: csDept.id, creditHours: 3, level: 100, hasLab: false },
    { code: 'CS102', name: 'Calculus I', departmentId: csDept.id, creditHours: 4, level: 100, hasLab: false },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: {},
      create: course,
    });
    console.log('Created course:', course.code);
  }

  // Create sections for different year levels
  const sections = [
    { code: 'SE-Y1-A', name: 'Section A', departmentId: seDept.id, yearLevel: 1, capacity: 40, advisor: 'Dr. Johnson' },
    { code: 'SE-Y1-B', name: 'Section B', departmentId: seDept.id, yearLevel: 1, capacity: 40, advisor: 'Dr. Williams' },
    { code: 'SE-Y2-A', name: 'Section A', departmentId: seDept.id, yearLevel: 2, capacity: 35, advisor: 'Dr. Brown' },
    { code: 'CS-Y1-A', name: 'Section A', departmentId: csDept.id, yearLevel: 1, capacity: 45, advisor: 'Dr. Davis' },
  ];

  for (const section of sections) {
    await prisma.section.upsert({
      where: { code: section.code },
      update: {},
      create: section,
    });
    console.log('Created section:', section.code);
  }

  // Get references for schedules
  const seY1A = await prisma.section.findUnique({ where: { code: 'SE-Y1-A' } });
  const seY1B = await prisma.section.findUnique({ where: { code: 'SE-Y1-B' } });
  const seY2A = await prisma.section.findUnique({ where: { code: 'SE-Y2-A' } });
  const csY1A = await prisma.section.findUnique({ where: { code: 'CS-Y1-A' } });

  const se101 = await prisma.course.findUnique({ where: { code: 'SE101' } });
  const se102 = await prisma.course.findUnique({ where: { code: 'SE102' } });
  const se103 = await prisma.course.findUnique({ where: { code: 'SE103' } });
  const se104 = await prisma.course.findUnique({ where: { code: 'SE104' } });
  const se201 = await prisma.course.findUnique({ where: { code: 'SE201' } });
  const se202 = await prisma.course.findUnique({ where: { code: 'SE202' } });

  const roomA101 = await prisma.room.findUnique({ where: { name: 'A101' } });
  const roomA102 = await prisma.room.findUnique({ where: { name: 'A102' } });
  const roomB201 = await prisma.room.findUnique({ where: { name: 'B201' } });

  const ts1 = await prisma.timeSlot.findUnique({ where: { code: 'TS1' } });
  const ts2 = await prisma.timeSlot.findUnique({ where: { code: 'TS2' } });
  const ts3 = await prisma.timeSlot.findUnique({ where: { code: 'TS3' } });
  const ts4 = await prisma.timeSlot.findUnique({ where: { code: 'TS4' } });
  const ts5 = await prisma.timeSlot.findUnique({ where: { code: 'TS5' } });

  if (!seY1A || !se101 || !se102 || !se103 || !roomA101 || !roomB201 || !ts1 || !ts2 || !ts3 || !ts4) {
    throw new Error('Required entities not found for schedules');
  }

  // Create schedules for SE Year 1 Section A
  const schedules = [
    { sectionId: seY1A.id, courseId: se101.id, teacherId: teacher.id, roomId: roomB201.id, timeSlotId: ts1.id },
    { sectionId: seY1A.id, courseId: se102.id, teacherId: teacher.id, roomId: roomA101.id, timeSlotId: ts2.id },
    { sectionId: seY1A.id, courseId: se103.id, teacherId: teacher.id, roomId: roomA101.id, timeSlotId: ts4.id },
  ];

  // Add SE Year 1 Section B schedules (different times)
  if (seY1B && se104 && roomA102 && ts3 && ts5) {
    schedules.push(
      { sectionId: seY1B.id, courseId: se101.id, teacherId: teacher.id, roomId: roomB201.id, timeSlotId: ts2.id },
      { sectionId: seY1B.id, courseId: se104.id, teacherId: teacher.id, roomId: roomA102.id, timeSlotId: ts5.id },
    );
  }

  // Add SE Year 2 Section A schedules
  if (seY2A && se201 && se202 && ts5) {
    schedules.push(
      { sectionId: seY2A.id, courseId: se201.id, teacherId: teacher.id, roomId: roomB201.id, timeSlotId: ts3.id },
      { sectionId: seY2A.id, courseId: se202.id, teacherId: teacher.id, roomId: roomA101.id, timeSlotId: ts5.id },
    );
  }

  for (const schedule of schedules) {
    await prisma.schedule.upsert({
      where: {
        sectionId_courseId_timeSlotId: {
          sectionId: schedule.sectionId,
          courseId: schedule.courseId,
          timeSlotId: schedule.timeSlotId,
        },
      },
      update: {},
      create: schedule,
    });
    console.log('Created schedule for section:', schedule.sectionId, 'course:', schedule.courseId);
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
