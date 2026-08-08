import { createSchoolAdminUser } from '@/lib/services/auth.service';
import { findProfilesBySchool, findProfileByIdSimple, setProfileActive } from '@/lib/repositories/profiles.repository';
import { getRoleByName } from '@/lib/repositories/roles.repository';
import { isSuperAdmin, type AuthSession } from '@/lib/auth';
import { badRequest, forbidden, notFound } from '@/lib/api';

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

export async function toggleUserAccess(session: AuthSession, userId: string, activate: boolean) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can manage admin access');
  if (userId === session.userId) throw badRequest('You cannot revoke your own access');
  const profile = await findProfileByIdSimple(userId);
  if (!profile) throw notFound('User not found');
  if (profile.role_id) {
    const superAdminRole = await getRoleByName('SUPER_ADMIN');
    if (superAdminRole && profile.role_id === superAdminRole.id) {
      throw badRequest('Cannot revoke access for a super admin');
    }
  }
  return setProfileActive(userId, activate, session.userId);
}
