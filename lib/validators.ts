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
export const schoolSchema = z.object({
  school_code: z.string().min(2, 'School code is required').max(20),
  school_name: z.string().min(2, 'School name is required').max(150),
  registration_number: z.string().max(50).optional().or(z.literal('')),
  affiliation_board: z.string().max(80).optional().or(z.literal('')),
  school_type: z.string().max(80).optional().or(z.literal('')),
  principal_name: z.string().max(120).optional().or(z.literal('')),
  establishment_date: z.string().optional().or(z.literal('')),
  registration_date: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(250).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  state: z.string().max(80).optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
  zipcode: z.string().max(20).optional().or(z.literal('')),
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
export const staffSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required').max(30),
  first_name: z.string().min(1, 'First name is required').max(80),
  last_name: z.string().min(1, 'Last name is required').max(80),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  mobile: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  designation: z.string().max(80).optional().or(z.literal('')),
  department: z.string().max(80).optional().or(z.literal('')),
  joining_date: z.string().optional().or(z.literal('')),
  qualification: z.string().max(120).optional().or(z.literal('')),
  salary: z.coerce.number().min(0).optional().or(z.literal(0)),
  address: z.string().max(250).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  state: z.string().max(80).optional().or(z.literal('')),
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
