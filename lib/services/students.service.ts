import {
  countStudents,
  findStudentById,
  findStudents,
  insertStudent,
  recentStudents,
  setStudentActive,
  updateStudent,
  type StudentQuery,
} from '@/lib/repositories/students.repository';
import { canAccessSchool, type AuthSession } from '@/lib/auth';
import { forbidden, notFound } from '@/lib/api';

function ensureSchoolAccess(session: AuthSession, schoolId: string) {
  if (!canAccessSchool(session, schoolId)) throw forbidden('You cannot manage this school');
}

export async function listStudents(session: AuthSession, query: StudentQuery) {
  ensureSchoolAccess(session, query.schoolId);
  return findStudents(query);
}

export async function getStudent(session: AuthSession, id: string) {
  const student = await findStudentById(id);
  if (!student) throw notFound('Student not found');
  ensureSchoolAccess(session, student.school_id);
  return student;
}

function toISODate(v: unknown): string | null {
  if (!v || typeof v !== 'string') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createStudent(session: AuthSession, schoolId: string, input: Record<string, unknown>) {
  ensureSchoolAccess(session, schoolId);
  const { date_of_birth, admission_date, ...rest } = input;
  return insertStudent({
    ...rest,
    date_of_birth: toISODate(date_of_birth),
    admission_date: toISODate(admission_date),
    school: { connect: { id: schoolId } },
    created_by: session.userId,
    updated_by: session.userId,
  } as any);
}

export async function editStudent(session: AuthSession, id: string, input: Record<string, unknown>) {
  const existing = await findStudentById(id);
  if (!existing) throw notFound('Student not found');
  ensureSchoolAccess(session, existing.school_id);
  const { date_of_birth, admission_date, ...rest } = input;
  return updateStudent(id, {
    ...rest,
    date_of_birth: toISODate(date_of_birth),
    admission_date: toISODate(admission_date),
    updated_by: session.userId,
  } as any);
}

export async function toggleStudentActive(session: AuthSession, id: string, isActive: boolean) {
  const existing = await findStudentById(id);
  if (!existing) throw notFound('Student not found');
  ensureSchoolAccess(session, existing.school_id);
  return setStudentActive(id, isActive, session.userId);
}

export async function getStudentStats(schoolId: string) {
  return { total: await countStudents(schoolId) };
}

export async function getRecentStudents(schoolId: string, limit = 5) {
  return recentStudents(schoolId, limit);
}
