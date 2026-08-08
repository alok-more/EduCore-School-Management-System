import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function findProfileById(id: string) {
  return prisma.profile.findUnique({
    where: { id },
    include: { role: true, school: { select: { id: true, school_name: true, school_code: true } } },
  });
}

export async function findProfileByEmail(email: string) {
  return prisma.profile.findUnique({
    where: { email },
    include: { role: true, school: { select: { id: true, school_name: true, school_code: true } } },
  });
}

export async function insertProfile(input: Prisma.ProfileCreateInput) {
  return prisma.profile.create({ data: input });
}

export async function updateProfile(id: string, input: Prisma.ProfileUpdateInput) {
  return prisma.profile.update({ where: { id }, data: input });
}

export async function countSchoolAdmins() {
  const role = await prisma.role.findUnique({ where: { role_name: 'SCHOOL_ADMIN' } });
  if (!role) return 0;
  return prisma.profile.count({ where: { role_id: role.id } });
}

export async function findProfilesBySchool(schoolId: string) {
  return prisma.profile.findMany({
    where: { school_id: schoolId },
    include: { role: true },
  });
}

export async function setProfileActive(id: string, isActive: boolean, updatedBy: string) {
  return prisma.profile.update({
    where: { id },
    data: { is_active: isActive, updated_by: updatedBy },
    include: { role: true, school: { select: { id: true, school_name: true, school_code: true } } },
  });
}

export async function findProfileByIdSimple(id: string) {
  return prisma.profile.findUnique({ where: { id } });
}
