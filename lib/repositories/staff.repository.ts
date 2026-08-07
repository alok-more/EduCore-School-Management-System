import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { PaginatedResult } from '@/lib/types';

export interface StaffQuery {
  schoolId: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function findStaff(q: StaffQuery): Promise<PaginatedResult<any>> {
  const {
    schoolId, search = '', isActive,
    page = 1, pageSize = 10,
    sortBy = 'created_at', sortDir = 'desc',
  } = q;

  const where: Prisma.StaffWhereInput = { school_id: schoolId };
  if (search) {
    where.OR = [
      { first_name: { contains: search, mode: 'insensitive' } },
      { last_name: { contains: search, mode: 'insensitive' } },
      { employee_code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { designation: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (typeof isActive === 'boolean') where.is_active = isActive;

  const [data, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.staff.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function findStaffById(id: string) {
  return prisma.staff.findUnique({ where: { id } });
}

export async function insertStaff(input: Prisma.StaffCreateInput) {
  return prisma.staff.create({
    data: {
      ...input,
      date_of_birth: input.date_of_birth
        ? new Date(input.date_of_birth as string)
        : null,

      joining_date: input.joining_date
        ? new Date(input.joining_date as string)
        : null,
    },
  });
}

export async function updateStaff(
  id: string,
  input: Prisma.StaffUpdateInput
) {
  return prisma.staff.update({
    where: { id },
    data: {
      ...input,

      date_of_birth: input.date_of_birth
        ? new Date(input.date_of_birth as string)
        : undefined,

      joining_date: input.joining_date
        ? new Date(input.joining_date as string)
        : undefined,
    },
  });
}

export async function setStaffActive(id: string, isActive: boolean, updatedBy: string | null) {
  return prisma.staff.update({
    where: { id },
    data: { is_active: isActive, updated_by: updatedBy },
  });
}

export async function countStaff(schoolId: string) {
  return prisma.staff.count({ where: { school_id: schoolId } });
}

export async function recentStaff(schoolId: string, limit = 5) {
  return prisma.staff.findMany({
    where: { school_id: schoolId },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}
