import { createSchoolAdminUser } from '@/lib/services/auth.service';
import { findProfilesBySchool } from '@/lib/repositories/profiles.repository';
import { getRoleByName } from '@/lib/repositories/roles.repository';
import { isSuperAdmin, type AuthSession } from '@/lib/auth';
import { badRequest, forbidden } from '@/lib/api';

export async function listUsers(session: AuthSession, schoolId?: string) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can list users');
  if (!schoolId) return [];
  return findProfilesBySchool(schoolId);
}

export async function createUser(
  session: AuthSession,
  input: {
    school_id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile?: string;
    password: string;
  },
) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can create school admins');
  const role = await getRoleByName('SCHOOL_ADMIN');
  if (!role) throw badRequest('SCHOOL_ADMIN role not found');
  return createSchoolAdminUser({ ...input, role_id: role.id, created_by: session.userId });
}
