import {
  countSchools,
  findSchoolById,
  findSchools,
  insertSchool,
  setSchoolActive,
  updateSchool,
  type SchoolQuery,
} from '@/lib/repositories/schools.repository';
import { isSuperAdmin, type AuthSession } from '@/lib/auth';
import { forbidden, notFound } from '@/lib/api';

export async function listSchools(session: AuthSession, query: SchoolQuery) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can list all schools');
  return findSchools(query);
}

export async function getSchool(session: AuthSession, id: string) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can view schools');
  const school = await findSchoolById(id);
  if (!school) throw notFound('School not found');
  return school;
}

// export async function createSchool(session: AuthSession, input: Record<string, unknown>) {
//   if (!isSuperAdmin(session)) throw forbidden('Only super admins can create schools');
//   return insertSchool({
//     ...input,
//     created_by: session.userId,
//     updated_by: session.userId,
//   } as any);
// }


export async function createSchool(
  session: AuthSession,
  input: Record<string, any>
) {
  if (!isSuperAdmin(session))
    throw forbidden("Only super admins can create schools");

  return insertSchool({
    ...input,

    establishment_date: input.establishment_date
      ? new Date(input.establishment_date)
      : null,

    registration_date: input.registration_date
      ? new Date(input.registration_date)
      : null,

    created_by: session.userId,
    updated_by: session.userId,
    school_code: '',
    school_name: ''
  });
}

export async function editSchool(
  session: AuthSession,
  id: string,
  input: Record<string, any>
) {
  if (!isSuperAdmin(session))
    throw forbidden("Only super admins can edit schools");

  const existing = await findSchoolById(id);
  if (!existing) throw notFound("School not found");

  return updateSchool(id, {
    ...input,

    establishment_date: input.establishment_date
      ? new Date(input.establishment_date)
      : null,

    registration_date: input.registration_date
      ? new Date(input.registration_date)
      : null,

    updated_by: session.userId,
  });
}

export async function toggleSchoolActive(session: AuthSession, id: string, isActive: boolean) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can deactivate schools');
  const existing = await findSchoolById(id);
  if (!existing) throw notFound('School not found');
  return setSchoolActive(id, isActive, session.userId);
}

export async function getSchoolStats(session: AuthSession) {
  if (!isSuperAdmin(session)) throw forbidden('Only super admins can view platform stats');
  return countSchools();
}
