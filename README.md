# EduCore — School Management System

A modern, production-ready, multi-tenant School Management System (SaaS-style) built with clean architecture, role-based access control (RBAC), and a professional ERP-grade UI.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Reference](#api-reference)
8. [Frontend Pages](#frontend-pages)
9. [Features](#features)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Demo Credentials](#demo-credentials)
13. [Scripts](#scripts)
14. [Coding Standards](#coding-standards)

---

## Overview

EduCore is a multi-tenant school management platform with two user roles:

- **Super Admin** — manages all schools on the platform, creates school administrators, and views platform-wide statistics.
- **School Admin** — manages staff and students within their assigned school.

The application follows a strict layered architecture (Repository → Service → Controller), uses JWT authentication with bcrypt password hashing, and implements soft deletes with full audit trails on every entity.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework with server-side rendering |
| **TypeScript** | Type-safe development throughout |
| **Tailwind CSS** | Utility-first styling with custom design system |
| **shadcn/ui** | Reusable, accessible UI components |
| **React Hook Form** | Form state management and validation |
| **Zod** | Schema validation (shared between client and server) |
| **Lucide Icons** | Icon system |
| **Recharts** | Dashboard charts and data visualization |
| **Sonner** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **Next.js API Routes** | REST API endpoints (controller layer) |
| **Prisma ORM** | Type-safe PostgreSQL database access |
| **JWT (jsonwebtoken)** | Stateless token-based authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation at API boundaries |

### Database
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database |

---

## Architecture

The application follows a **feature-based, layered architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Pages → Components → Auth Provider → API Client      │
└────────────────────────┬────────────────────────────┘
                         │ HTTP (JSON)
┌────────────────────────▼────────────────────────────┐
│              API Route Handlers (Controllers)         │
│  Parse request → Validate → Call service → Respond    │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   Service Layer                        │
│  Business logic + RBAC enforcement + Audit fields     │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                Repository Layer                        │
│  Prisma ORM queries — all database operations          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                  PostgreSQL                            │
└─────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Controller** (API routes) | Parse HTTP request, validate input with Zod, call service, return JSON response |
| **Service** | Business logic, role-based access control, audit field population |
| **Repository** | Database queries via Prisma ORM — the only layer that touches the database |

---

## Folder Structure

```
educore/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API route handlers (controllers)
│   │   ├── auth/
│   │   │   ├── login/route.ts    # POST /api/auth/login
│   │   │   ├── logout/route.ts  # POST /api/auth/logout
│   │   │   └── me/route.ts       # GET /api/auth/me
│   │   ├── dashboard/
│   │   │   └── stats/route.ts    # GET /api/dashboard/stats
│   │   ├── schools/
│   │   │   ├── route.ts          # GET, POST /api/schools
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE /api/schools/:id
│   │   ├── staff/
│   │   │   ├── route.ts          # GET, POST /api/staff
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE /api/staff/:id
│   │   ├── students/
│   │   │   ├── route.ts          # GET, POST /api/students
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE /api/students/:id
│   │   └── users/
│   │       └── route.ts          # GET, POST /api/users
│   ├── dashboard/               # Dashboard page (role-aware)
│   ├── login/                   # Login page
│   ├── profile/                 # User profile page
│   ├── schools/                 # Schools list, add, edit, view
│   ├── staff/                   # Staff list, add, edit
│   ├── students/                # Students list, add, edit
│   ├── globals.css              # Global styles + design tokens
│   ├── layout.tsx               # Root layout (providers)
│   └── page.tsx                 # Root redirect
│
├── components/
│   ├── layout/                  # Shared layout components
│   │   ├── breadcrumbs.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── dashboard-shell.tsx
│   │   ├── data-table.tsx       # Reusable table (sort, search, paginate)
│   │   ├── empty-state.tsx
│   │   ├── navbar.tsx
│   │   ├── page-header.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeletons.tsx
│   │   ├── stat-card.tsx
│   │   └── status-badge.tsx
│   ├── providers/
│   │   ├── auth-provider.tsx    # Auth context (JWT cookie-based)
│   │   └── theme-provider.tsx   # Dark mode provider
│   ├── schools/school-form.tsx
│   ├── staff/staff-form.tsx
│   ├── students/student-form.tsx
│   └── ui/                      # shadcn/ui primitives
│
├── hooks/
│   ├── use-api.ts               # Fetch hook + typed API helpers
│   └── use-toast.ts
│
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # JWT + bcrypt utilities, RBAC helpers
│   ├── session.ts               # Server-side session resolution (JWT cookie)
│   ├── api.ts                   # API response helpers
│   ├── validators.ts            # Zod schemas (shared client/server)
│   ├── types/
│   │   ├── index.ts             # AuthSession, JwtPayload, DTOs
│   │   └── database.ts          # Re-exports Prisma model types
│   ├── repositories/            # Repository layer (Prisma queries)
│   │   ├── roles.repository.ts
│   │   ├── schools.repository.ts
│   │   ├── profiles.repository.ts
│   │   ├── staff.repository.ts
│   │   └── students.repository.ts
│   └── services/                # Service layer (business logic + RBAC)
│       ├── auth.service.ts
│       ├── dashboard.service.ts
│       ├── schools.service.ts
│       ├── staff.service.ts
│       ├── students.service.ts
│       └── users.service.ts
│
├── prisma/
│   ├── schema.prisma            # Prisma schema (PostgreSQL)
│   └── seed.ts                  # Database seed script
│
├── middleware.ts                # Next.js middleware
├── tailwind.config.ts           # Tailwind design system
├── tsconfig.json
└── package.json
```

---

## Database Schema

### Entities

#### 1. Role
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Primary key |
| `role_name` | VARCHAR(50), unique | `SUPER_ADMIN` or `SCHOOL_ADMIN` |
| `description` | TEXT | Role description |
| `is_active` | BOOLEAN | Soft-delete flag |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### 2. School
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Primary key |
| `school_code` | VARCHAR(20), unique | Unique school code |
| `school_name` | VARCHAR(150) | School name |
| `registration_number` | VARCHAR(50) | Registration number |
| `affiliation_board` | VARCHAR(80) | CBSE, ICSE, State, etc. |
| `school_type` | VARCHAR(80) | Senior Secondary, Secondary, etc. |
| `principal_name` | VARCHAR(120) | Principal's name |
| `establishment_date` | DATE | Date established |
| `registration_date` | DATE | Date registered |
| `email` | VARCHAR(150) | Contact email |
| `phone` | VARCHAR(30) | Contact phone |
| `address` | VARCHAR(250) | Street address |
| `city` | VARCHAR(80) | City |
| `state` | VARCHAR(80) | State |
| `country` | VARCHAR(80) | Country |
| `zipcode` | VARCHAR(20) | Postal code |
| `is_active` | BOOLEAN | Soft-delete flag |
| `created_at` | TIMESTAMP | Audit |
| `created_by` | UUID | Audit — who created this record |
| `updated_at` | TIMESTAMP | Audit |
| `updated_by` | UUID | Audit — who last updated this record |

#### 3. Profile (User)
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Primary key |
| `school_id` | UUID (FK → Schools) | Null for super admins |
| `role_id` | UUID (FK → Roles) | User's role |
| `first_name` | VARCHAR(80) | First name |
| `last_name` | VARCHAR(80) | Last name |
| `email` | VARCHAR(150), unique | Login email |
| `mobile` | VARCHAR(30) | Phone number |
| `password_hash` | VARCHAR(255) | bcrypt password hash |
| `last_login` | TIMESTAMP | Last login time |
| `login_attempts` | INTEGER | Failed login counter |
| `account_locked` | BOOLEAN | Account lock flag |
| `is_active` | BOOLEAN | Soft-delete flag |
| `created_at`, `created_by`, `updated_at`, `updated_by` | — | Audit fields |

#### 4. Staff
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Primary key |
| `school_id` | UUID (FK → Schools) | School assignment |
| `employee_code` | VARCHAR(30) | Unique within school |
| `first_name`, `last_name` | VARCHAR(80) | Name |
| `gender` | VARCHAR(10) | Male/Female/Other |
| `date_of_birth` | DATE | Date of birth |
| `mobile` | VARCHAR(30) | Phone |
| `email` | VARCHAR(150) | Email |
| `designation` | VARCHAR(80) | Job title |
| `department` | VARCHAR(80) | Department |
| `joining_date` | DATE | Joining date |
| `qualification` | VARCHAR(120) | Qualifications |
| `salary` | DECIMAL(12,2) | Salary |
| `address`, `city`, `state` | — | Address |
| `is_active` | BOOLEAN | Soft-delete flag |
| `created_at`, `created_by`, `updated_at`, `updated_by` | — | Audit fields |

#### 5. Student
| Field | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Primary key |
| `school_id` | UUID (FK → Schools) | School assignment |
| `roll_no` | VARCHAR(30) | Unique within school |
| `first_name`, `middle_name`, `last_name` | VARCHAR(80) | Name |
| `gender` | VARCHAR(10) | Male/Female/Other |
| `date_of_birth` | DATE | Date of birth |
| `blood_group` | VARCHAR(10) | Blood group |
| `admission_date` | DATE | Admission date |
| `status` | VARCHAR(20) | Active/Inactive/Graduated/Suspended |
| `photo` | VARCHAR(500) | Photo URL |
| `is_active` | BOOLEAN | Soft-delete flag |
| `created_at`, `created_by`, `updated_at`, `updated_by` | — | Audit fields |

### Relationships

```
School ──┬── has many ──→ Profile (User)
         ├── has many ──→ Staff
         └── has many ──→ Student

Role ──── has many ──→ Profile (User)
```

---

## Authentication & Authorization

### Authentication Flow

1. User submits email + password to `POST /api/auth/login`.
2. Server looks up the profile by email, verifies the bcrypt password hash.
3. On success, a JWT token is signed (7-day expiry) and set as an HTTP-only cookie.
4. The client receives the session object (without the token) in the response.
5. Subsequent requests include the cookie automatically; the server verifies the JWT on each API call.

### JWT Token Payload

```json
{
  "sub": "user-uuid",
  "email": "admin@maplewood.test",
  "role": "SCHOOL_ADMIN",
  "schoolId": "school-uuid",
  "firstName": "Ravi",
  "lastName": "Kumar",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control (RBAC)

| Action | SUPER_ADMIN | SCHOOL_ADMIN |
|---|---|---|
| View platform dashboard | ✅ | ❌ |
| List all schools | ✅ | ❌ |
| Create / edit / deactivate schools | ✅ | ❌ |
| Create school admin users | ✅ | ❌ |
| View school dashboard | ❌ | ✅ |
| Manage staff (own school) | ❌ | ✅ |
| Manage students (own school) | ❌ | ✅ |
| View profile | ✅ | ✅ |

School admins are **scoped to their own school** — they cannot access data from other schools. This is enforced in the service layer via `canAccessSchool()` checks.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Get current session |

### Schools (Super Admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schools` | List schools (paginated, searchable, sortable) |
| `POST` | `/api/schools` | Create a new school |
| `GET` | `/api/schools/:id` | Get a single school |
| `PUT` | `/api/schools/:id` | Update a school |
| `DELETE` | `/api/schools/:id?activate=true\|false` | Activate / deactivate (soft delete) |

### Students (School Admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | List students (paginated, searchable, filterable) |
| `POST` | `/api/students` | Add a student |
| `GET` | `/api/students/:id` | Get a single student |
| `PUT` | `/api/students/:id` | Update a student |
| `DELETE` | `/api/students/:id?activate=true\|false` | Activate / deactivate (soft delete) |

### Staff (School Admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/staff` | List staff (paginated, searchable, sortable) |
| `POST` | `/api/staff` | Add a staff member |
| `GET` | `/api/staff/:id` | Get a single staff member |
| `PUT` | `/api/staff/:id` | Update a staff member |
| `DELETE` | `/api/staff/:id?activate=true\|false` | Activate / deactivate (soft delete) |

### Users (Super Admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users?schoolId=...` | List admin users for a school |
| `POST` | `/api/users` | Create a school admin user |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Role-aware dashboard statistics |

### Query Parameters

All list endpoints support:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page (max 100) |
| `search` | string | — | Full-text search |
| `sortBy` | string | `created_at` | Sort column |
| `sortDir` | `asc` \| `desc` | `desc` | Sort direction |
| `isActive` | `true` \| `false` | — | Filter by active status |

---

## Frontend Pages

### Authentication
- **Login** (`/login`) — Split-screen login with brand panel and demo credentials

### Super Admin
- **Dashboard** (`/dashboard`) — Platform stats (total/active/inactive schools, admin count) + enrollment charts
- **Schools** (`/schools`) — Sortable, searchable, paginated school list with activate/deactivate
- **Add School** (`/schools/new`) — Create school form with validation
- **Edit School** (`/schools/[id]/edit`) — Edit school form
- **View School** (`/schools/[id]`) — School details + create school admin section

### School Admin
- **Dashboard** (`/dashboard`) — School stats (total students/staff, recent additions) + charts
- **Students** (`/students`) — Sortable, searchable student list with status badges
- **Add Student** (`/students/new`) — Enroll student form
- **Edit Student** (`/students/[id]/edit`) — Edit student form
- **Staff** (`/staff`) — Sortable, searchable staff list
- **Add Staff** (`/staff/new`) — Add staff form
- **Edit Staff** (`/staff/[id]/edit`) — Edit staff form

### Shared
- **Profile** (`/profile`) — View account information

---

## Features

- **JWT Authentication** — Stateless, HTTP-only cookie-based, 7-day expiry
- **Password Hashing** — bcrypt with 10 salt rounds
- **Role-Based Access Control (RBAC)** — Enforced at the service layer
- **Soft Delete** — Records are deactivated (`is_active = false`), never permanently deleted
- **Audit Fields** — Every entity tracks `created_at`, `created_by`, `updated_at`, `updated_by`
- **Global Search** — Search across school names, codes, cities, emails, staff, and students
- **Pagination** — Server-side pagination with configurable page size
- **Sorting** — Click any sortable column header to sort ascending/descending
- **Filtering** — Filter by active/inactive status, student status
- **Toast Notifications** — Success and error feedback for all actions
- **Loading Skeletons** — Shimmer placeholders during data fetches
- **Empty States** — Friendly messages with CTAs when no data exists
- **Confirmation Dialogs** — Before any activate/deactivate action
- **Form Validation** — Client and server-side validation with Zod
- **Responsive Design** — Mobile-first layout with collapsible sidebar
- **Dark Mode** — System-aware theme toggle with full dark color system
- **Dashboard Charts** — Area, bar, and pie charts with dummy trend data

---

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ (running locally or via a cloud provider)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd educore

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secret

# 4. Generate Prisma client
npx prisma generate

# 5. Create database tables
npx prisma db push

# 6. Seed the database with demo data
npx prisma db seed

# 7. Start the development server
npm run dev
```

### Database Setup

The app uses Prisma ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

```bash
# Create all tables from the Prisma schema
npx prisma db push

# Seed demo data (roles, schools, users, staff, students)
npx prisma db seed

# Open Prisma Studio to browse/edit data
npx prisma studio
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string (Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/educore?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_NAME="EduCore"
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | ✅ | Secret key used to sign JWT tokens |
| `JWT_EXPIRES_IN` | Optional | Token expiry (default: `7d`) |
| `NEXT_PUBLIC_APP_NAME` | Optional | App name shown in UI |

---

## Demo Credentials

After running the seed script, these accounts are available:

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@educore.test` | `Educ0re!Super` |
| School Admin (Maplewood) | `admin@maplewood.test` | `Educ0re!Admin` |
| School Admin (Sunrise) | `admin@sunrise.test` | `Educ0re!Admin` |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checker |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Coding Standards

- **TypeScript everywhere** — No raw JavaScript; all files are `.ts` or `.tsx`.
- **Clean architecture** — Controllers handle HTTP; services contain business logic; repositories manage database access.
- **Reusable components** — Shared UI components in `components/layout/` and `components/ui/`.
- **Proper interfaces** — All types and DTOs defined in `lib/types/`.
- **Prisma ORM** — Type-safe database access with generated client.
- **Environment variables** — All secrets and configuration via `.env`.
- **Audit fields** — Every entity tracks who created and updated it, plus timestamps.
- **Soft delete** — `is_active` flag instead of row deletion.
- **RBAC** — Role checks enforced in the service layer before any mutation.
- **Error handling** — Centralized API response helpers with consistent error format.
- **Validation** — Zod schemas shared between client and server for input validation.

---

## License

This project is licensed under the MIT License.
