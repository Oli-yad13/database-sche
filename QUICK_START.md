# 🚀 Quick Start Guide

## ✅ What's Done

### Database Setup
- ✅ **PostgreSQL:** Prisma dev server running on port 51213
- ✅ **Schema:** All 10 tables migrated successfully
- ✅ **Prisma Client:** Generated and ready to use

### Project Structure
- ✅ **Backend:** NestJS initialized (src/app.module.ts)
- ✅ **Frontend:** Next.js 16 with App Router
- ✅ **Database Models:** User, Department, Course, Room, TimeSlot, Semester, Section, Enrollment, Grade

---

## 📊 View Your Database

The easiest way to view and populate your database is using **Prisma Studio**:

```bash
cd backend
npx prisma studio
```

This opens a visual database browser at **http://localhost:5555**

---

## 🌱 Manually Add Sample Data (via Prisma Studio)

### 1. Create an Admin User
1. Open Prisma Studio: `cd backend && npx prisma studio`
2. Click on "User" table
3. Click "Add record"
4. Fill in:
   - username: `admin`
   - passwordHash: `temp123` (we'll add bcrypt later)
   - role: `admin`
   - firstName: `Admin`
   - lastName: `User`
   - email: `admin@university.edu`
5. Click "Save 1 change"

### 2. Create a Department
1. Click on "Department" table
2. Add record:
   - name: `Software Engineering`
   - code: `SE`

### 3. Create a Course
1. Click on "Course" table
2. Add record:
   - departmentId: `1` (the SE department we just created)
   - code: `SE101`
   - name: `Introduction to Programming`
   - creditHours: `3`
   - defaultSemester: `1`
   - description: `Basic programming concepts`

### 4. Create a Room
1. Click on "Room" table
2. Add record:
   - name: `A101`
   - capacity: `40`
   - type: `lecture`

### 5. Create a Time Slot
1. Click on "TimeSlot" table
2. Add record:
   - dayOfWeek: `Mon`
   - startTime: `08:30:00`
   - endTime: `10:00:00`

### 6. Create a Semester
1. Click on "Semester" table
2. Add record:
   - name: `Fall 2025`
   - startDate: `2025-09-01T00:00:00.000Z`
   - endDate: `2025-12-31T00:00:00.000Z`

---

## 🔧 Testing Backend (NestJS)

### 1. Start the Backend
```bash
cd backend
npm run start:dev
```

Should see:
```
[Nest] LOG [NestApplication] Nest application successfully started
```

Backend runs on **http://localhost:3000**

### 2. Test the API
Open browser or use curl:
```bash
curl http://localhost:3000
```

Should return: `Hello World!` (from app.controller.ts)

---

## 🎨 Testing Frontend (Next.js)

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```

Should see:
```
▲ Next.js 16.1.6
- Local: http://localhost:3000
```

⚠️ **Note:** Both backend and frontend use port 3000 by default!

### 2. Change Frontend Port
Edit `frontend/package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001",
  ...
}
```

Or run with inline port:
```bash
cd frontend
npm run dev -- -p 3001
```

Frontend now runs on **http://localhost:3001**

---

## 🔗 Next Steps

### Phase 1: Backend Integration (Do First)

#### 1. Create Prisma Service

**Create `backend/src/prisma/prisma.service.ts`:**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Create `backend/src/prisma/prisma.module.ts`:**
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### 2. Update App Module

**Edit `backend/src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 3. Create First API Endpoint

**Create `backend/src/departments/departments.controller.ts`:**
```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.department.findMany();
  }
}
```

**Create `backend/src/departments/departments.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';

@Module({
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
```

**Update `backend/src/app.module.ts` imports:**
```typescript
imports: [PrismaModule, DepartmentsModule],
```

#### 4. Test the API
```bash
curl http://localhost:3000/departments
```

Should return array of departments from database!

---

### Phase 2: Authentication

Install dependencies:
```bash
cd backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

Then create:
- `auth/auth.module.ts`
- `auth/auth.service.ts` (handle login, register, JWT)
- `auth/auth.controller.ts` (POST /auth/login, /auth/register)
- `auth/jwt.strategy.ts` (validate JWT tokens)
- `auth/jwt-auth.guard.ts` (protect routes)

---

### Phase 3: Core CRUD Modules

Create modules for:
- Courses (`/courses`)
- Users (`/users`)
- Rooms (`/rooms`)
- Time Slots (`/time-slots`)
- Semesters (`/semesters`)
- Sections (`/sections`)
- Enrollments (`/enrollments`)

Each module needs:
- `*.controller.ts` (routes)
- `*.service.ts` (business logic)
- `*.module.ts` (module definition)

---

### Phase 4: Frontend Development

#### 1. Setup API Client

**Create `frontend/lib/api.ts`:**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

#### 2. Create First Page

**Create `frontend/app/departments/page.tsx`:**
```typescript
import { fetchAPI } from '@/lib/api';

export default async function DepartmentsPage() {
  const departments = await fetchAPI('/departments');

  return (
    <div>
      <h1>Departments</h1>
      <ul>
        {departments.map((dept: any) => (
          <li key={dept.id}>
            {dept.code} - {dept.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 3. Add CORS to Backend

**Edit `backend/src/main.ts`:**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
```

---

## 📚 Documentation

- **Project Analysis:** See `PROJECT_ANALYSIS.md` for full system overview
- **Setup Details:** See `SETUP_COMPLETE.md` for migration details
- **Design Notes:** See `DESIGN_NOTES.md` for feature specifications

---

## 🐛 Troubleshooting

### "Can't reach database server"
```bash
cd backend
npx prisma dev start
```

### "Migration failed"
```bash
cd backend
npx prisma migrate reset  # WARNING: Deletes all data
npx prisma migrate dev --name init
```

### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### Ports in use
- Backend: 3000 (change in `backend/src/main.ts`)
- Frontend: 3001 (change with `npm run dev -- -p PORT`)
- Prisma Studio: 5555
- Database: 51213-51215

---

## ✅ Success Checklist

- [x] Database schema migrated
- [x] Prisma Client generated
- [ ] Prisma service created in NestJS
- [ ] First API endpoint working
- [ ] Frontend connected to backend
- [ ] Sample data added
- [ ] Authentication implemented
- [ ] Scheduling algorithm integrated

---

**Status:** Database ready, now build the API! 🚀
**Next:** Create Prisma service in NestJS (see Phase 1 above)
