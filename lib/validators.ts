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
export const studentSchema = z.object({
  roll_no: z.string().min(1, 'Roll number is required').max(30),
  first_name: z.string().min(1, 'First name is required').max(80),
  middle_name: z.string().max(80).optional().or(z.literal('')),
  last_name: z.string().min(1, 'Last name is required').max(80),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  blood_group: z.string().max(10).optional().or(z.literal('')),
  admission_date: z.string().optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive', 'Graduated', 'Suspended']).default('Active'),
  photo: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});
export type StudentInput = z.infer<typeof studentSchema>;
