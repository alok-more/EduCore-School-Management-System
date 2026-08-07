import { prisma } from '@/lib/prisma';
import { countSchoolAdmins } from '@/lib/repositories/profiles.repository';
import { countSchools } from '@/lib/repositories/schools.repository';
import { countStaff, recentStaff } from '@/lib/repositories/staff.repository';
import { countStudents, recentStudents } from '@/lib/repositories/students.repository';
import { isSuperAdmin, type AuthSession } from '@/lib/auth';
import { forbidden } from '@/lib/api';

export async function getSuperAdminStats(session: AuthSession) {
  if (!isSuperAdmin(session)) throw forbidden('Super admin access required');
  const [schools, admins, schoolCards] = await Promise.all([
    countSchools(),
    countSchoolAdmins(),
    prisma.school.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      take: 6,
      select: {
        id: true,
        school_name: true,
        school_code: true,
        city: true,
        state: true,
        email: true,
        phone: true,
        affiliation_board: true,
        school_type: true,
        principal_name: true,
        is_active: true,
      },
    }),
  ]);

  const cards = await Promise.all(
    schoolCards.map(async (s) => {
      const [studentCount, staffCount] = await Promise.all([
        prisma.student.count({ where: { school_id: s.id, is_active: true } }),
        prisma.staff.count({ where: { school_id: s.id, is_active: true } }),
      ]);
      return { ...s, studentCount, staffCount };
    }),
  );

  return {
    totalSchools: schools.total,
    activeSchools: schools.active,
    inactiveSchools: schools.inactive,
    totalAdmins: admins,
    schoolCards: cards,
  };
}

export async function getSchoolAdminStats(session: AuthSession) {
  if (!session?.schoolId) throw forbidden('School admin access required');
  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
    select: {
      id: true,
      school_name: true,
      school_code: true,
      city: true,
      state: true,
      affiliation_board: true,
      principal_name: true,
      email: true,
      phone: true,
    },
  });

  const [students, staff, recentStu, recentStf] = await Promise.all([
    countStudents(session.schoolId),
    countStaff(session.schoolId),
    recentStudents(session.schoolId, 5),
    recentStaff(session.schoolId, 5),
  ]);
  return {
    school,
    totalStudents: students,
    totalStaff: staff,
    recentStudents: recentStu,
    recentStaff: recentStf,
  };
}