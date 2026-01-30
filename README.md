# 🎓 University Scheduling System

A comprehensive college scheduling system built with modern technologies to automate course scheduling, manage enrollments, track prerequisites, and handle complex academic workflows.

## 🚀 Tech Stack

- **Backend:** NestJS (Node.js framework)
- **Frontend:** Next.js 16 with React 19
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + Refresh Tokens with bcrypt
- **Styling:** Tailwind CSS 4
- **Validation:** class-validator & class-transformer

## ✨ Features

### Core Functionality

- ✅ **User Authentication** - Secure JWT-based auth with role-based access control
- ✅ **Role Management** - Admin, Teacher, and Student roles
- ✅ **Course Catalog** - Manage courses with prerequisites and co-requisites
- ✅ **Section Scheduling** - Create and manage course sections
- ✅ **Room Management** - Track rooms with capacity and equipment
- ✅ **Time Slot Management** - Standardized time blocks for scheduling
- ✅ **Student Enrollment** - Enroll students with prerequisite validation
- ✅ **Grade Tracking** - Record and track student grades

### Advanced Features (Enhanced Schema)

- 🚧 **Academic Programs** - Define degree programs and curricula
- 🚧 **Student Profiles** - Track student progress, GPA, and academic standing
- 🚧 **Teacher Profiles** - Manage teaching loads and availability
- 🚧 **Multi-Session Courses** - Support for courses with multiple weekly sessions
- 🚧 **Conflict Detection** - Automatic detection of scheduling conflicts
- 🚧 **Enrollment Waitlist** - Waitlist management for full sections
- 🚧 **Schedule Versioning** - Draft and publish schedule versions
- 🚧 **Auto-Scheduler** - AI-powered automatic schedule generation
- 🚧 **Reports & Analytics** - Room utilization, teacher workload, enrollment stats

## 📁 Project Structure

```
scheduling-system-fdb/
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── common/        # Guards, decorators, pipes
│   │   ├── prisma/        # Database service
│   │   └── ...            # Other modules (to be added)
│   ├── prisma/
│   │   ├── schema.prisma  # Current database schema
│   │   ├── schema-enhanced.prisma # Production-ready schema
│   │   └── migrations/    # Database migrations
│   └── .env              # Environment variables
│
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   └── ...               # Components (to be added)
│
└── docs/                  # Documentation
    ├── SCHEMA_ANALYSIS.md
    ├── AUTH_SYSTEM_COMPLETE.md
    ├── PROJECT_ANALYSIS.md
    └── NEXT_STEPS.md
```

## 🗂️ Database Schema

### Current Schema (Basic)

- Users (admin, teacher, student roles)
- Departments
- Courses (with prerequisites)
- Rooms
- Time Slots
- Semesters
- Sections
- Enrollments
- Grades

### Enhanced Schema (Production-Ready)

All of the above PLUS:

- RefreshToken (for JWT refresh)
- AcademicYear
- Program & Curriculum
- StudentProfile & TeacherProfile
- CourseSession (multi-session support)
- Conflict (scheduling conflicts)
- ScheduleVersion (draft/published schedules)
- EnrollmentWaitlist
- EnrollmentPeriod
- TeacherAvailability
- RoomUnavailability
- AuditLog

**25+ models** covering all real-world scheduling scenarios.

See `SCHEMA_ANALYSIS.md` for detailed analysis of what's needed and why.

## 🔐 Authentication API

### Public Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Endpoints

- `GET /api/auth/profile` - Get current user profile
- `PATCH /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout (invalidate token)
- `POST /api/auth/logout-all` - Logout from all devices

### Role-Based Access

```typescript
// Admin only
@Roles(Role.admin)
@Post('admin/action')
adminAction() { }

// Admin or Teacher
@Roles(Role.admin, Role.teacher)
@Get('reports')
getReports() { }

// Public route
@Public()
@Get('info')
getInfo() { }

// Get current user
@Get('me')
getMe(@CurrentUser() user: CurrentUserData) {
  return user;
}
```

See `AUTH_SYSTEM_COMPLETE.md` for full documentation.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### 1. Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd scheduling-system-fdb

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Database

```bash
cd backend

# Start Prisma dev database
npx prisma dev start

# Apply migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and set:
# - DATABASE_URL (already set for Prisma dev)
# - JWT_SECRET (change in production!)
# - JWT_REFRESH_SECRET (change in production!)
```

### 4. Start Development Servers

**Backend:**

```bash
cd backend
npm run start:dev
# Runs on http://localhost:3000/api
```

**Frontend:**

```bash
cd frontend
npm run dev -- -p 3001
# Runs on http://localhost:3001
```

### 5. Test Authentication

```bash
# Register admin user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@university.edu",
    "password": "Admin123!",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "Admin123!"
  }'
```

## 📚 Documentation

| Document                                             | Description                               |
| ---------------------------------------------------- | ----------------------------------------- |
| [NEXT_STEPS.md](./NEXT_STEPS.md)                     | **START HERE** - Step-by-step setup guide |
| [SCHEMA_ANALYSIS.md](./SCHEMA_ANALYSIS.md)           | Analysis of missing features & scenarios  |
| [AUTH_SYSTEM_COMPLETE.md](./AUTH_SYSTEM_COMPLETE.md) | Complete auth documentation               |
| [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)         | Overall project analysis                  |
| [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)             | Initial setup details                     |
| [QUICK_START.md](./QUICK_START.md)                   | Quick reference guide                     |

## 🎯 Roadmap

### Phase 1: Authentication & Core Setup ✅

- [x] Database schema design
- [x] Prisma setup and migrations
- [x] JWT authentication system
- [x] Role-based access control
- [x] User management API

### Phase 2: CRUD Modules (Current)

- [ ] Departments API
- [ ] Programs API
- [ ] Courses API (with prerequisites)
- [ ] Rooms API
- [ ] Time Slots API
- [ ] Semesters API
- [ ] Users management API

### Phase 3: Scheduling Core

- [ ] Sections API
- [ ] Teacher assignment
- [ ] Manual scheduling
- [ ] Conflict detection
- [ ] Enrollment API
- [ ] Prerequisite validation

### Phase 4: Advanced Scheduling

- [ ] Auto-scheduler algorithm
- [ ] Multi-session course support
- [ ] Teacher availability constraints
- [ ] Room equipment matching
- [ ] Schedule versioning
- [ ] Waitlist management

### Phase 5: Frontend

- [ ] Admin dashboard
- [ ] Course catalog UI
- [ ] Section management UI
- [ ] Timetable grid view
- [ ] Enrollment interface
- [ ] Teacher portal
- [ ] Student portal

### Phase 6: Production

- [ ] Email notifications
- [ ] Reports & analytics
- [ ] Audit logging
- [ ] Performance optimization
- [ ] Docker deployment
- [ ] CI/CD pipeline

## 🛠️ Development Commands

### Backend

```bash
# Development (auto-reload)
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm test

# Prisma Studio (DB GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## 🐛 Troubleshooting

### Database connection failed

```bash
cd backend
npx prisma dev start
```

### Prisma Client not generated

```bash
cd backend
npx prisma generate
```

### Port already in use

- Backend uses port 3000
- Frontend uses port 3001
- Change with `PORT=3002 npm run start:dev`

### Authentication errors

- Check JWT secrets in `.env`
- Verify token format: `Authorization: Bearer <token>`
- Check if token expired (access token: 15 min)

## 📖 API Documentation

Once the backend is running, API documentation will be available at:

- REST API: `http://localhost:3000/api`
- Swagger (future): `http://localhost:3000/api/docs`

## 🔒 Security

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT with short expiry (15 min access, 7 day refresh)
- ✅ Refresh token rotation
- ✅ Refresh tokens stored in database (revocable)
- ✅ Strong password requirements
- ✅ Input validation
- ✅ CORS protection
- ✅ SQL injection prevention (Prisma ORM)

### TODO (Production)

- [ ] Rate limiting
- [ ] Email verification
- [ ] 2FA support
- [ ] Security headers (helmet.js)
- [ ] HTTPS enforcement
- [ ] Account lockout after failed attempts

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📝 License

## 👥 Team

1. Henok Workineh
2. Hose Dereje
3. Michael Gesese
4. Nathenael Tamirat
5. Oliyad Bekele
6. Yani Akram

## 📞 Support

For issues and questions:

- Check documentation in `/docs`
- Review `NEXT_STEPS.md` for setup help
- See `SCHEMA_ANALYSIS.md` for feature details

---

**Status:** Core authentication complete, ready for CRUD module development.

**Last Updated:** 2026-01-28
