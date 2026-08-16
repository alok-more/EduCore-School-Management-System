import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Schools
// ---------------------------------------------------------------------------
const optStrSchool = (max: number) => z.string().max(max).optional().or(z.literal('')).or(z.null());

export const schoolSchema = z.object({
  school_code: z.string().min(2, 'School code is required').max(20),
  school_name: z.string().min(2, 'School name is required').max(150),
  registration_number: optStrSchool(50),
  affiliation_board: optStrSchool(80),
  school_type: optStrSchool(80),
  principal_name: optStrSchool(120),
  establishment_date: z.string().optional().or(z.literal('')).or(z.null()),
  registration_date: z.string().optional().or(z.literal('')).or(z.null()),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')).or(z.null()),
  phone: optStrSchool(30),
  address: optStrSchool(250),
  city: optStrSchool(80),
  state: optStrSchool(80),
  country: optStrSchool(80),
  zipcode: optStrSchool(20),
  is_active: z.boolean().default(true),
});
export type SchoolInput = z.infer<typeof schoolSchema>;

// ---------------------------------------------------------------------------
// Users (school admin creation)
// ---------------------------------------------------------------------------
export const createUserSchema = z.object({
  school_id: z.string().uuid('Select a school'),
  first_name: z.string().min(2, 'First name is required').max(80),
  last_name: z.string().min(1, 'Last name is required').max(80),
  email: z.string().email('Enter a valid email'),
  mobile: z.string().max(30).optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------
const optStrStaff = (max: number) => z.string().max(max).optional().or(z.literal('')).or(z.null());

export const staffSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required').max(30),
  first_name: z.string().min(1, 'First name is required').max(80),
  last_name: z.string().min(1, 'Last name is required').max(80),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')).or(z.null()),
  date_of_birth: z.string().optional().or(z.literal('')).or(z.null()),
  mobile: optStrStaff(30),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')).or(z.null()),
  designation: optStrStaff(80),
  department: optStrStaff(80),
  joining_date: z.string().optional().or(z.literal('')).or(z.null()),
  qualification: optStrStaff(120),
  salary: z.coerce.number().min(0).optional().or(z.literal(0)).or(z.null()),
  address: optStrStaff(250),
  city: optStrStaff(80),
  state: optStrStaff(80),
  country: optStrStaff(80),
  is_active: z.boolean().default(true),
});
export type StaffInput = z.infer<typeof staffSchema>;

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
const optStr = (max: number) => z.string().max(max).optional().or(z.literal('')).or(z.null());
const optNum = () => z.coerce.number().min(0).optional().or(z.literal(0)).or(z.null());

export const studentSchema = z.object({
  roll_no: z.string().min(1, 'Roll number is required').max(30),
  first_name: z.string().min(1, 'First name is required').max(80),
  middle_name: optStr(80),
  last_name: z.string().min(1, 'Last name is required').max(80),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')).or(z.null()),
  date_of_birth: z.string().optional().or(z.literal('')).or(z.null()),
  blood_group: optStr(10),
  admission_date: z.string().optional().or(z.literal('')).or(z.null()),
  status: z.enum(['Active', 'Inactive', 'Graduated', 'Suspended']).default('Active'),
  photo: optStr(500),
  father_name: optStr(120),
  mother_name: optStr(120),
  grandfather_name: optStr(120),
  aadhar_card_no: optStr(20),
  physical_disability: optStr(200),
  mother_tongue: optStr(80),
  identification_mark: optStr(200),
  caste: optStr(80),
  category: optStr(50),
  religion: optStr(80),
  previous_school: optStr(250),
  standard_sought: optStr(50),
  address: optStr(250),
  city: optStr(80),
  state: optStr(80),
  country: optStr(80),
  pin_code: optStr(20),
  phone: optStr(30),
  father_qualification: optStr(120),
  father_occupation: optStr(120),
  father_mobile: optStr(30),
  father_annual_income: optNum(),
  mother_qualification: optStr(120),
  mother_occupation: optStr(120),
  mother_mobile: optStr(30),
  mother_annual_income: optNum(),
  guardian_name: optStr(120),
  guardian_relationship: optStr(80),
  guardian_phone: optStr(30),
  is_active: z.boolean().default(true),
});
export type StudentInput = z.infer<typeof studentSchema>;
