import { prisma } from '@/lib/prisma';
import type { RoleName } from '@/lib/types';

export async function getRoleByName(name: RoleName) {
  return prisma.role.findUnique({ where: { role_name: name } });
}

export async function getRoleById(id: string) {
  return prisma.role.findUnique({ where: { id } });
}
