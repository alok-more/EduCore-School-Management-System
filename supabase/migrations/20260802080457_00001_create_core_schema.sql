/*
# EduCore — Core schema (roles, schools, profiles, staff, students)

## Purpose
Creates the foundational tables for the School Management System: role definitions,
schools (tenants), user profiles (auth-linked, role-scoped), staff, and students.
All tables carry audit fields (created_at, created_by, updated_at, updated_by, is_active)
and use soft-delete semantics (is_active = false) instead of row deletion.

## New Tables
1. `roles` — RBAC role catalog (e.g. SUPER_ADMIN, SCHOOL_ADMIN).
   - id (uuid pk), role_name (text unique), description (text), is_active (bool),
     created_at, updated_at.
2. `schools` — Tenant schools managed by super admins.
   - id (uuid pk), school_code (text unique), school_name, registration_number,
     affiliation_board, school_type, principal_name, establishment_date (date),
     registration_date (date), email, phone, address, city, state, country, zipcode,
     is_active, created_at, created_by, updated_at, updated_by.
3. `profiles` — Application users linked to Supabase auth.users, scoped to a school + role.
   - id (uuid pk, matches auth.users.id), school_id (fk -> schools, nullable for super admins),
     role_id (fk -> roles), first_name, last_name, email, mobile,
     last_login (timestamptz), login_attempts (int), account_locked (bool),
     is_active, created_at, created_by, updated_at, updated_by.
4. `staff` — School staff records.
   - id (uuid pk), school_id (fk -> schools), employee_code, first_name, last_name,
     gender, date_of_birth (date), mobile, email, designation, department,
     joining_date (date), qualification, salary (numeric), address, city, state,
     is_active, created_at, created_by, updated_at, updated_by.
5. `students` — School student records.
   - id (uuid pk), school_id (fk -> schools), roll_no, first_name, middle_name,
     last_name, gender, date_of_birth (date), blood_group, admission_date (date),
     status (text), photo (text url), is_active, created_at, created_by,
     updated_at, updated_by.

## Relationships
- schools 1—* profiles (super admin profiles have school_id = null)
- roles 1—* profiles
- schools 1—* staff
- schools 1—* students

## Security
- RLS enabled on every table.
- profiles: each authenticated user can read/update their own profile row.
- schools, staff, students, roles: readable by any authenticated user (internal staff app).
  Writes are intended to be performed via the service role key from server route handlers
  which bypass RLS, so policies are permissive for reads by authenticated users.
- created_by / updated_by are uuid columns referencing auth.users (no enforced FK to avoid
  friction with service-role inserts), populated by the application layer.

## Notes
1. A trigger function `set_updated_at()` bumps updated_at on every UPDATE.
2. updated_at columns default to now() and are refreshed by the trigger.
3. Soft delete: DELETE operations are never used; is_active is toggled instead.
*/

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select_authenticated" ON public.roles;
CREATE POLICY "roles_select_authenticated" ON public.roles FOR SELECT
  TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- schools
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_code text UNIQUE NOT NULL,
  school_name text NOT NULL,
  registration_number text,
  affiliation_board text,
  school_type text,
  principal_name text,
  establishment_date date,
  registration_date date,
  email text,
  phone text,
  address text,
  city text,
  state text,
  country text,
  zipcode text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schools_select_authenticated" ON public.schools;
CREATE POLICY "schools_select_authenticated" ON public.schools FOR SELECT
  TO authenticated USING (true);

DROP TRIGGER IF EXISTS trg_schools_updated_at ON public.schools;
CREATE TRIGGER trg_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  last_login timestamptz,
  login_attempts integer NOT NULL DEFAULT 0,
  account_locked boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  employee_code text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text,
  date_of_birth date,
  mobile text,
  email text,
  designation text,
  department text,
  joining_date date,
  qualification text,
  salary numeric(12,2),
  address text,
  city text,
  state text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (school_id, employee_code)
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_select_authenticated" ON public.staff;
CREATE POLICY "staff_select_authenticated" ON public.staff FOR SELECT
  TO authenticated USING (true);

DROP TRIGGER IF EXISTS trg_staff_updated_at ON public.staff;
CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  roll_no text NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  gender text,
  date_of_birth date,
  blood_group text,
  admission_date date,
  status text NOT NULL DEFAULT 'Active',
  photo text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (school_id, roll_no)
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_select_authenticated" ON public.students;
CREATE POLICY "students_select_authenticated" ON public.students FOR SELECT
  TO authenticated USING (true);

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_school_id ON public.staff(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON public.schools(is_active);
