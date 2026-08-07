import {
  countStaff,
  findStaff,
  findStaffById,
  insertStaff,
  recentStaff,
  setStaffActive,
  updateStaff,
  type StaffQuery,
} from '@/lib/repositories/staff.repository';
import { canAccessSchool, type AuthSession } from '@/lib/auth';
import { forbidden, notFound } from '@/lib/api';

function ensureSchoolAccess(session: AuthSession, schoolId: string) {
  if (!canAccessSchool(session, schoolId)) throw forbidden('You cannot manage this school');
}

export async function listStaff(session: AuthSession, query: StaffQuery) {
  ensureSchoolAccess(session, query.schoolId);
  return findStaff(query);
}

export async function getStaff(session: AuthSession, id: string) {
  const staff = await findStaffById(id);
  if (!staff) throw notFound('Staff member not found');
  ensureSchoolAccess(session, staff.school_id);
  return staff;
}

export async function createStaff(session: AuthSession, schoolId: string, input: Record<string, unknown>) {
  ensureSchoolAccess(session, schoolId);
  return insertStaff({
    ...input,
    school: { connect: { id: schoolId } },
    created_by: session.userId,
    updated_by: session.userId,
  } as any);
}

export async function editStaff(session: AuthSession, id: string, input: Record<string, unknown>) {
  const existing = await findStaffById(id);
  if (!existing) throw notFound('Staff member not found');
  ensureSchoolAccess(session, existing.school_id);
  return updateStaff(id, { ...input, updated_by: session.userId } as any);
}

export async function toggleStaffActive(session: AuthSession, id: string, isActive: boolean) {
  const existing = await findStaffById(id);
  if (!existing) throw notFound('Staff member not found');
  ensureSchoolAccess(session, existing.school_id);
  return setStaffActive(id, isActive, session.userId);
}

export async function getStaffStats(schoolId: string) {
  return { total: await countStaff(schoolId) };
}

export async function getRecentStaff(schoolId: string, limit = 5) {
  return recentStaff(schoolId, limit);
}
