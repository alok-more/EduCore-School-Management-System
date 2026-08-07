import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { PaginatedResult } from '@/lib/types';

export interface SchoolQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function findSchools(q: SchoolQuery = {}): Promise<PaginatedResult<any>> {
  const {
    search = '',
    isActive,
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    sortDir = 'desc',
  } = q;

  const where: Prisma.SchoolWhereInput = {};
  if (search) {
    where.OR = [
      { school_name: { contains: search, mode: 'insensitive' } },
      { school_code: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (typeof isActive === 'boolean') where.is_active = isActive;

  const [data, total] = await Promise.all([
    prisma.school.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.school.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findSchoolById(id: string) {
  return prisma.school.findUnique({ where: { id } });
}

export async function insertSchool(input: Prisma.SchoolCreateInput) {
  return prisma.school.create({ data: input });
}

export async function updateSchool(id: string, input: Prisma.SchoolUpdateInput) {
  return prisma.school.update({ where: { id }, data: input });
}

export async function setSchoolActive(id: string, isActive: boolean, updatedBy: string | null) {
  return prisma.school.update({
    where: { id },
    data: { is_active: isActive, updated_by: updatedBy },
  });
}

export async function countSchools() {
  const [total, active] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { is_active: true } }),
  ]);
  return { total, active, inactive: total - active };
}
