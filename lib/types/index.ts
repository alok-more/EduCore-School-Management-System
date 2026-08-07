export type RoleName = 'SUPER_ADMIN' | 'SCHOOL_ADMIN';

export interface AuthSession {
  userId: string;
  email: string;
  role: RoleName;
  schoolId: string | null;
  firstName: string;
  lastName: string;
  mobile?: string | null;
  schoolName?: string | null;
  schoolCode?: string | null;
  createdAt?: string | null;
  lastLogin?: string | null;
  isActive?: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleName;
  schoolId: string | null;
  firstName: string;
  lastName: string;
}

// DTOs for API responses
export interface SchoolDTO {
  id: string;
  school_code: string;
  school_name: string;
  registration_number: string | null;
  affiliation_board: string | null;
  school_type: string | null;
  principal_name: string | null;
  establishment_date: string | null;
  registration_date: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipcode: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentDTO {
  id: string;
  school_id: string;
  roll_no: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  admission_date: string | null;
  status: string;
  photo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffDTO {
  id: string;
  school_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  date_of_birth: string | null;
  mobile: string | null;
  email: string | null;
  designation: string | null;
  department: string | null;
  joining_date: string | null;
  qualification: string | null;
  salary: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
