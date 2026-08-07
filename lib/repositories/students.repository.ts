import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { PaginatedResult } from '@/lib/types';

export interface StudentQuery {
  schoolId: string;
  search?: string;
  status?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function findStudents(q: StudentQuery): Promise<PaginatedResult<any>> {
  const {
    schoolId, search = '', status, isActive,
    page = 1, pageSize = 10,
    sortBy = 'created_at', sortDir = 'desc',
  } = q;

  const where: Prisma.StudentWhereInput = { school_id: schoolId };

  if (search) {
    where.OR = [
      { first_name: { contains: search, mode: 'insensitive' } },
      { last_name: { contains: search, mode: 'insensitive' } },
      { roll_no: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;

  if (typeof isActive === 'boolean') {
    where.is_active = isActive;
  }

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  // ADD DEBUG HERE
  console.log(
    "Students from DB:",
    data.map((s) => ({
      id: s.id,
      is_active: s.is_active,
    }))
  );

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findStudentById(id: string) {
  return prisma.student.findUnique({ where: { id } });
}

export async function insertStudent(input: Prisma.StudentCreateInput) {
  return prisma.student.create({ data: input });
}

export async function updateStudent(id: string, input: Prisma.StudentUpdateInput) {
  return prisma.student.update({ where: { id }, data: input });
}

export async function setStudentActive(
  id: string,
  isActive: boolean,
  updatedBy: string | null
) {
  console.log("Updating student:", { id, isActive });

  const student = await prisma.student.update({
    where: { id },
    data: {
      is_active: isActive,
      updated_by: updatedBy,
    },
  });

  const verify = await prisma.student.findUnique({
    where: { id },
  });

  console.log("Updated student:", student.is_active);
  console.log("Verified from DB:", verify?.is_active);

  return student;
}

export async function countStudents(schoolId: string) {
  return prisma.student.count({ where: { school_id: schoolId } });
}

export async function recentStudents(schoolId: string, limit = 5) {
  return prisma.student.findMany({
    where: { school_id: schoolId },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}
