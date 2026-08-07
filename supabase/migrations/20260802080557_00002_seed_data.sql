/*
# EduCore — Seed data (roles, schools, users, staff, students)

## Purpose
Populates the database with the two RBAC roles, two demo schools, their auth users
(super admin + two school admins), matching profile rows, plus sample staff and
students for the demo schools so the dashboards and lists are populated.

## Changes
1. Insert SUPER_ADMIN and SCHOOL_ADMIN roles (idempotent via ON CONFLICT).
2. Insert two schools (SCH001 — Maplewood, SCH002 — Sunrise).
3. Create three auth.users with fixed passwords (bcrypt via crypt()):
   - superadmin@educore.test / Educ0re!Super  (SUPER_ADMIN, no school)
   - admin@maplewood.test   / Educ0re!Admin    (SCHOOL_ADMIN, Maplewood)
   - admin@sunrise.test      / Educ0re!Admin    (SCHOOL_ADMIN, Sunrise)
4. Insert matching profiles referencing those auth.users and roles.
5. Insert sample staff and students for each school.

## Notes
1. pgcrypto provides crypt()/gen_salt() for bcrypt hashing.
2. Re-running is safe: ON CONFLICT skips existing rows; deterministic UUIDs are used.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (role_name, description, is_active)
VALUES
  ('SUPER_ADMIN', 'Platform-wide administrator with access to all schools.', true),
  ('SCHOOL_ADMIN', 'Administrator scoped to a single school.', true)
ON CONFLICT (role_name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Schools
-- ---------------------------------------------------------------------------
INSERT INTO public.schools (
  id, school_code, school_name, registration_number, affiliation_board, school_type,
  principal_name, establishment_date, registration_date, email, phone, address,
  city, state, country, zipcode, is_active
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'SCH001', 'Maplewood International School', 'REG-MW-2010', 'CBSE', 'Senior Secondary',
    'Dr. Anita Rao', '1998-06-15', '2010-04-01', 'info@maplewood.test', '+918822334455',
    '12 Hill Road', 'Bengaluru', 'Karnataka', 'India', '560001', true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'SCH002', 'Sunrise Public School', 'REG-SR-2012', 'ICSE', 'Secondary',
    'Mr. Vikram Shah', '2001-09-01', '2012-06-12', 'info@sunrise.test', '+919911223344',
    '45 Lake View', 'Pune', 'Maharashtra', 'India', '411001', true
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Auth users (deterministic UUIDs)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  super_admin_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  maple_admin_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  sunrise_admin_id uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    email_change, email_change_token_new, recovery_token, confirmation_token,
    is_sso_user, is_anonymous
  )
  VALUES
  (
    super_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'superadmin@educore.test', crypt('Educ0re!Super', gen_salt('bf')), now(),
    now(), now(), null,
    jsonb_build_object('role', 'SUPER_ADMIN'),
    jsonb_build_object('first_name', 'System', 'last_name', 'Administrator'),
    '', '', '', '', false, false
  ),
  (
    maple_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@maplewood.test', crypt('Educ0re!Admin', gen_salt('bf')), now(),
    now(), now(), null,
    jsonb_build_object('role', 'SCHOOL_ADMIN'),
    jsonb_build_object('first_name', 'Ravi', 'last_name', 'Kumar'),
    '', '', '', '', false, false
  ),
  (
    sunrise_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@sunrise.test', crypt('Educ0re!Admin', gen_salt('bf')), now(),
    now(), now(), null,
    jsonb_build_object('role', 'SCHOOL_ADMIN'),
    jsonb_build_object('first_name', 'Priya', 'last_name', 'Nair'),
    '', '', '', '', false, false
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (
  id, school_id, role_id, first_name, last_name, email, mobile, is_active
)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, r.id,
  'System', 'Administrator', 'superadmin@educore.test', '+919900000001', true
FROM public.roles r WHERE r.role_name = 'SUPER_ADMIN'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, school_id, role_id, first_name, last_name, email, mobile, is_active
)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111', r.id,
  'Ravi', 'Kumar', 'admin@maplewood.test', '+919911001100', true
FROM public.roles r WHERE r.role_name = 'SCHOOL_ADMIN'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, school_id, role_id, first_name, last_name, email, mobile, is_active
)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222', r.id,
  'Priya', 'Nair', 'admin@sunrise.test', '+919922002200', true
FROM public.roles r WHERE r.role_name = 'SCHOOL_ADMIN'
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Staff (Maplewood)
-- ---------------------------------------------------------------------------
INSERT INTO public.staff (
  school_id, employee_code, first_name, last_name, gender, date_of_birth, mobile, email,
  designation, department, joining_date, qualification, salary, address, city, state, is_active
)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'EMP001', 'Suresh', 'Menon', 'Male', '1985-03-12', '+919811100001', 'suresh.menon@maplewood.test', 'Senior Teacher', 'Mathematics', '2015-06-01', 'M.Sc, B.Ed', 55000, 'MG Road', 'Bengaluru', 'Karnataka', true),
  ('11111111-1111-1111-1111-111111111111', 'EMP002', 'Latha', 'Iyer', 'Female', '1988-07-22', '+919811100002', 'latha.iyer@maplewood.test', 'Teacher', 'Science', '2017-06-15', 'M.Sc, B.Ed', 48000, 'Indiranagar', 'Bengaluru', 'Karnataka', true),
  ('11111111-1111-1111-1111-111111111111', 'EMP003', 'Joseph', 'Pinto', 'Male', '1980-11-05', '+919811100003', 'joseph.pinto@maplewood.test', 'Librarian', 'Library', '2012-04-10', 'B.Lib', 36000, 'Jayanagar', 'Bengaluru', 'Karnataka', true),
  ('11111111-1111-1111-1111-111111111111', 'EMP004', 'Meena', 'Reddy', 'Female', '1990-02-18', '+919811100004', 'meena.reddy@maplewood.test', 'Lab Assistant', 'Science Lab', '2019-07-01', 'B.Sc', 30000, 'Koramangala', 'Bengaluru', 'Karnataka', true)
ON CONFLICT DO NOTHING;

-- Staff (Sunrise)
INSERT INTO public.staff (
  school_id, employee_code, first_name, last_name, gender, date_of_birth, mobile, email,
  designation, department, joining_date, qualification, salary, address, city, state, is_active
)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'EMP101', 'Ramesh', 'Gupta', 'Male', '1982-05-09', '+919822200001', 'ramesh.gupta@sunrise.test', 'Senior Teacher', 'English', '2014-06-01', 'M.A, B.Ed', 52000, 'Camp Road', 'Pune', 'Maharashtra', true),
  ('22222222-2222-2222-2222-222222222222', 'EMP102', 'Sunita', 'Joshi', 'Female', '1986-09-30', '+919822200002', 'sunita.joshi@sunrise.test', 'Teacher', 'Hindi', '2016-06-12', 'M.A, B.Ed', 46000, 'FC Road', 'Pune', 'Maharashtra', true),
  ('22222222-2222-2222-2222-222222222222', 'EMP103', 'Anil', 'Deshpande', 'Male', '1979-12-21', '+919822200003', 'anil.deshpande@sunrise.test', 'Accountant', 'Accounts', '2011-03-15', 'B.Com', 40000, 'Shivaji Nagar', 'Pune', 'Maharashtra', false)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Students (Maplewood)
-- ---------------------------------------------------------------------------
INSERT INTO public.students (
  school_id, roll_no, first_name, middle_name, last_name, gender, date_of_birth,
  blood_group, admission_date, status, is_active
)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'R001', 'Aarav', 'Kumar', 'Sharma', 'Male', '2012-04-10', 'O+', '2020-06-15', 'Active', true),
  ('11111111-1111-1111-1111-111111111111', 'R002', 'Diya', 'Raj', 'Nair', 'Female', '2013-08-22', 'A+', '2021-06-14', 'Active', true),
  ('11111111-1111-1111-1111-111111111111', 'R003', 'Kabir', 'Singh', 'Verma', 'Male', '2011-12-05', 'B+', '2019-06-16', 'Active', true),
  ('11111111-1111-1111-1111-111111111111', 'R004', 'Ananya', 'Devi', 'Rao', 'Female', '2014-01-30', 'AB+', '2022-06-13', 'Active', true),
  ('11111111-1111-1111-1111-111111111111', 'R005', 'Ishaan', 'Kumar', 'Gupta', 'Male', '2012-09-18', 'O-', '2020-06-15', 'Inactive', false)
ON CONFLICT DO NOTHING;

-- Students (Sunrise)
INSERT INTO public.students (
  school_id, roll_no, first_name, middle_name, last_name, gender, date_of_birth,
  blood_group, admission_date, status, is_active
)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'S001', 'Saanvi', 'Raj', 'Patil', 'Female', '2013-03-14', 'A+', '2021-06-15', 'Active', true),
  ('22222222-2222-2222-2222-222222222222', 'S002', 'Vivaan', 'Kumar', 'Joshi', 'Male', '2012-07-09', 'B+', '2020-06-16', 'Active', true),
  ('22222222-2222-2222-2222-222222222222', 'S003', 'Aanya', 'Devi', 'Deshmukh', 'Female', '2014-11-25', 'O+', '2022-06-14', 'Active', true),
  ('22222222-2222-2222-2222-222222222222', 'S004', 'Reyansh', 'Singh', 'Kulkarni', 'Male', '2011-05-02', 'AB+', '2019-06-17', 'Active', true)
ON CONFLICT DO NOTHING;
