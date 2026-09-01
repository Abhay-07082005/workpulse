# WorkPulse • Employee Attendance & Leave Management System

An enterprise-grade, full-stack Employee Attendance and Leave Management System designed with clean modular architecture, production-quality TypeScript, robust REST APIs, security best practices, and intuitive UI/UX.

---

## 🌟 Key Features

### 1. Employee Authentication & Authorization
* **JWT-Based Authentication**: Secure authentication stored in HTTP-Only cookies with fallback `Authorization: Bearer <token>` support.
* **Role-Based Access Control (RBAC)**: Strict role separation between `EMPLOYEE` and `HR_ADMIN`.
* **Password Hashing**: `bcryptjs` salted password hashing with standard cost factors.
* **One-Click Persona Switcher**: Demo switcher directly in the navbar to quickly evaluate both HR Admin (`Sarah Jenkins`) and Employee (`Alex Rivera`) workflows.

### 2. Daily Punch In / Punch Out & Punctuality Engine
* **One-Click Check-In / Check-Out**: Fast punch logging with optional location selection (Office HQ, Remote, Client Site) and handoff notes.
* **Punctuality Evaluation**:
  * **On-Time**: Check-in on or before **09:30 AM**.
  * **Late Arrival**: Check-in after **09:30 AM** (automatically flags status as `LATE`).
* **Live Session Timer**: Real-time counter and progress bar measuring active shift progress towards the standard 8.0-hour workday.

### 3. Automatic Working Hours & Overtime Calculation
* **Precise Hour Computation**: Dynamic decimal calculation of worked hours (`workingHours = (checkOut - checkIn) / 3,600,000`).
* **Overtime Accrual**: Work performed exceeding standard 8.0 hours is automatically credited to `overtime` metric.
* **Dynamic Half-Day Detection**: Auto-evaluated based on total session length (< 4.5 hours flagged as half day).

### 4. Comprehensive Leave Management & Automatic Balance Deductions
* **Categorized Leave Quotas**:
  * **Casual Leave**: 12 days / year
  * **Sick Leave**: 10 days / year
  * **Annual Paid Leave**: 15 days / year
* **Automatic Balance Deduction**:
  * Applying for leave auto-checks against available quota in that category.
  * When HR approves a leave, the days requested are immediately subtracted from remaining balance.
* **Full Leave History**: Status badges (`PENDING`, `APPROVED`, `REJECTED`), duration ranges, employee reasons, and HR review comments.

### 5. HR Analytics & Management Dashboard
* **Real-Time KPIs**: Total Headcount, Present Today, Late Arrivals, Unexcused Absences, On Leave, and Company Attendance Rate %.
* **Interactive Charts (Recharts)**:
  * **7-Day Attendance Velocity Area Chart**: Present, Late, and Absent trends.
  * **Department-Wise Performance Bar Chart**: Attendance ratios across Engineering, HR, Product, Marketing, Sales, Operations.
* **Live Presence Feed**: Real-time audit log of today's active punches.

### 6. Company-Wide Attendance Logs & CSV Export
* **Multi-Criteria Filter Toolbar**: Search by employee name/code, filter by department, filter by status, and date range picker (`startDate` to `endDate`).
* **CSV Data Export**: One-click download of attendance audit logs for payroll and compliance reporting.
* **Punch Inspector Modal**: Detailed breakdown of timestamps, durations, overtime, and location notes.

### 7. Staff & Employee Directory
* Complete organization roster with avatars, department alignment, employee code, today's status badge, and remaining leave quotas.

---

## 🏗️ Architecture & Project Structure

The project follows a clean **N-Tier Full-Stack Architecture**:

```
├── server/                          # Backend Application Root
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                # Database engine & seed data repository
│   │   ├── controllers/             # Request handling & HTTP response mapping
│   │   │   ├── auth.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── leave.controller.ts
│   │   │   └── hr.controller.ts
│   │   ├── middleware/              # Express middlewares
│   │   │   ├── auth.middleware.ts   # JWT verification & RBAC guards
│   │   │   ├── error.middleware.ts  # Global error handling
│   │   │   └── validate.middleware.ts # Zod schema validation
│   │   ├── routes/                  # API route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── attendance.routes.ts
│   │   │   ├── leave.routes.ts
│   │   │   └── hr.routes.ts
│   │   ├── services/                # Core business logic & computations
│   │   │   ├── auth.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── leave.service.ts
│   │   │   └── hr.service.ts
│   │   ├── utils/                   # Shared time and security utilities
│   │   │   ├── csvExporter.ts
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── timeUtils.ts
│   │   └── validators/              # Zod input validation schemas
│   │       ├── attendance.schema.ts
│   │       ├── auth.schema.ts
│   │       └── leave.schema.ts
│   └── prisma/
│       └── schema.prisma            # PostgreSQL Database Schema definition
│
├── src/                             # Frontend React Application
│   ├── components/
│   │   ├── common/                  # Reusable UI components (Badges, Cards, Modals, Pagination)
│   │   ├── dashboard/               # Employee dashboard widgets & calendar
│   │   ├── hr/                      # HR charts, tables, and leave managers
│   │   ├── layout/                  # Responsive AppLayout (Sidebar + Navbar)
│   │   └── leaves/                  # Leave balance & application modals
│   ├── context/                     # Global state (Auth, Theme, Toast)
│   ├── pages/                       # Route view components
│   ├── services/                    # Axios API client services
│   └── types/                       # Shared TypeScript models and interfaces
│
├── server.ts                        # Express server entry point with Vite middleware
├── Dockerfile                       # Multi-stage production container build
└── docker-compose.yml               # Container orchestration
```

---

## 🗄️ Database Design (`prisma/schema.prisma`)

```prisma
enum Role {
  EMPLOYEE
  HR_ADMIN
}

enum AttendanceStatus {
  PRESENT
  LATE
  HALF_DAY
  ABSENT
  ON_LEAVE
  IN_PROGRESS
  COMPLETED
}

enum LeaveType {
  CASUAL
  SICK
  ANNUAL
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id           String            @id @default(uuid())
  email        String            @unique
  password     String
  name         String
  role         Role              @default(EMPLOYEE)
  department   String
  designation  String
  employeeCode String            @unique
  avatar       String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  attendances  AttendanceRecord[]
  leaveRequests LeaveRequest[]
  leaveBalance LeaveBalance?
}

model AttendanceRecord {
  id           String           @id @default(uuid())
  employeeId   String
  employee     User             @relation(fields: [employeeId], references: [id])
  date         String           // YYYY-MM-DD
  checkIn      DateTime?
  checkOut     DateTime?
  workingHours Float            @default(0)
  overtime     Float            @default(0)
  status       AttendanceStatus @default(PRESENT)
  location     String?          @default("Office HQ")
  notes        String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@unique([employeeId, date])
}

model LeaveBalance {
  id          String   @id @default(uuid())
  employeeId  String   @unique
  employee    User     @relation(fields: [employeeId], references: [id])
  year        Int
  casualLeave Int      @default(12)
  sickLeave   Int      @default(10)
  annualLeave Int      @default(15)
  usedCasual  Int      @default(0)
  usedSick    Int      @default(0)
  usedAnnual  Int      @default(0)
  updatedAt   DateTime @updatedAt
}

model LeaveRequest {
  id           String      @id @default(uuid())
  employeeId   String
  employee     User        @relation(fields: [employeeId], references: [id])
  leaveType    LeaveType
  startDate    String      // YYYY-MM-DD
  endDate      String      // YYYY-MM-DD
  daysCount    Int
  reason       String
  status       LeaveStatus @default(PENDING)
  adminComment String?
  reviewedBy   String?
  reviewedAt   DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

---

## 📡 REST API Reference

### Authentication
* `POST /api/auth/login` — Sign in with email and password
* `POST /api/auth/register` — Register a new employee with initial balance
* `POST /api/auth/logout` — Clear auth session
* `GET  /api/auth/me` — Fetch currently authenticated user profile and leave balance

### Attendance (Employee)
* `POST /api/attendance/check-in` — Punch in for today (evaluates late arrival if > 09:30 AM)
* `POST /api/attendance/check-out` — Punch out and calculate working hours & overtime
* `GET  /api/attendance/today` — Current day's punch status and active session
* `GET  /api/attendance/my-attendance` — Paginated history with date/status filters
* `GET  /api/attendance/summary` — Punctuality and working hours summary
* `GET  /api/attendance/export/my-csv` — Export personal timesheet to CSV

### Leave Management
* `POST /api/leaves/apply` — Apply for leave (validates balance quota)
* `GET  /api/leaves/my-leaves` — Employee's leave applications
* `GET  /api/leaves/balance` — Current remaining leave balance
* `GET  /api/leaves/all` — *(HR)* All company leave requests
* `PATCH /api/leaves/:id/review` — *(HR)* Approve or reject leave with auto-balance deduction

### HR Administration
* `GET /api/hr/dashboard` — Analytics KPIs, 7-day velocity trends, and department breakdowns
* `GET /api/hr/attendance` — Company-wide attendance logs with search, department, and date filters
* `GET /api/hr/employees` — Staff directory with today's presence and balance
* `GET /api/hr/export/attendance-csv` — Download company-wide attendance CSV

---

## 🚀 Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhay-07082005/workpulse.git
   cd workpulse
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your own values:
   - `JWT_SECRET` — any long random string (used to sign auth tokens)
   - `GEMINI_API_KEY` — your Gemini API key (only required for AI-powered features; the rest of the app works without it)
   - `DATABASE_URL` is not used at runtime and can stay commented out — this app persists data to a local JSON file, not a live database.

3. **Build and start the container:**
   ```bash
   docker-compose up --build
   ```
   The application will be accessible at `http://localhost:3000`. On first run, the database auto-seeds with the demo users and sample attendance/leave data listed below.

4. **Log in** with any of the [seed demo credentials](#-seed-demo-credentials) below.

5. **Verify data persists across restarts** (optional): stop the container with `Ctrl+C`, then run `docker-compose up` again (no `--build` needed) — your check-ins and leave requests from step 4 should still be there.

6. **Stop the app:**
   ```bash
   docker-compose down
   ```

---

## 👥 Seed Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **HR Admin** | Sarah Jenkins | `hr@workpulse.io` | `password123` |
| **Employee** | Alex Rivera | `alex@workpulse.io` | `password123` |
| **Employee** | Elena Rostova | `elena@workpulse.io` | `password123` |
| **Employee** | Marcus Chen | `marcus@workpulse.io` | `password123` |
