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

export async function createStudent(
  session: AuthSession,
  schoolId: string,
  input: Record<string, any>
) {
  ensureSchoolAccess(session, schoolId);

  return insertStudent({
    ...input,

    date_of_birth: input.date_of_birth
      ? new Date(input.date_of_birth)
      : null,

    admission_date: input.admission_date
      ? new Date(input.admission_date)
      : null,

    school: {
      connect: {
        id: schoolId,
      },
    },

    created_by: session.userId,
    updated_by: session.userId,
    roll_no: '',
    first_name: '',
    last_name: ''
  });
}

export async function editStudent(
  session: AuthSession,
  id: string,
  input: Record<string, any>
) {
  const existing = await findStudentById(id);
  if (!existing) throw notFound("Student not found");

  ensureSchoolAccess(session, existing.school_id);

  return updateStudent(id, {
    ...input,

    date_of_birth: input.date_of_birth
      ? new Date(input.date_of_birth)
      : null,

    admission_date: input.admission_date
      ? new Date(input.admission_date)
      : null,

    updated_by: session.userId,
  });
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
