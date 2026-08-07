// Re-exports Prisma model types under the names used throughout the app.
// This lets pages import from '@/lib/types/database' while the actual
// types come from the generated Prisma client.

import type { School as PrismaSchool, Staff as PrismaStaff, Student as PrismaStudent, Profile as PrismaProfile, Role as PrismaRole } from '@prisma/client';

export type SchoolRow = PrismaSchool;
export type StaffRow = PrismaStaff;
export type StudentRow = PrismaStudent;
export type ProfileRow = PrismaProfile;
export type RoleRow = PrismaRole;

export type RoleName = 'SUPER_ADMIN' | 'SCHOOL_ADMIN';

export interface ProfileWithRole extends PrismaProfile {
  role: Pick<PrismaRole, 'id' | 'role_name'>;
  school: { id: string; school_name: string; school_code: string } | null;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: RoleName;
  schoolId: string | null;
  firstName: string;
  lastName: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Database {
  public: {
    Tables: {
      roles: { Row: RoleRow; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      schools: { Row: SchoolRow; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      profiles: { Row: ProfileRow; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      staff: { Row: StaffRow; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      students: { Row: StudentRow; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
  };
}
