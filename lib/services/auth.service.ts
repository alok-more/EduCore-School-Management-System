import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth';
import type { JwtPayload } from '@/lib/types';

export interface LoginResult {
  token: string;
  payload: JwtPayload;
  profile: {
    mobile: string | null;
    schoolName: string | null;
    schoolCode: string | null;
    createdAt: Date;
    lastLogin: Date | null;
    isActive: boolean;
  };
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResult | null> {
  const profile = await prisma.profile.findUnique({
    where: { email },
    include: {
      role: true,
      school: { select: { id: true, school_name: true, school_code: true } },
    },
  });
  if (!profile) return null;
  if (!profile.is_active || profile.account_locked) return null;

  const valid = await verifyPassword(password, profile.password_hash);
  if (!valid) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { login_attempts: { increment: 1 } },
    });
    return null;
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { last_login: new Date(), login_attempts: 0 },
  });

  const payload: JwtPayload = {
    sub: profile.id,
    email: profile.email,
    role: profile.role.role_name as 'SUPER_ADMIN' | 'SCHOOL_ADMIN',
    schoolId: profile.school_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
  };

  return {
    token: signToken(payload),
    payload,
    profile: {
      mobile: profile.mobile,
      schoolName: profile.school?.school_name ?? null,
      schoolCode: profile.school?.school_code ?? null,
      createdAt: profile.created_at,
      lastLogin: profile.last_login,
      isActive: profile.is_active,
    },
  };
}

export async function createSchoolAdminUser(input: {
  school_id: string;
  role_id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
  password: string;
  created_by: string;
}) {
  const password_hash = await hashPassword(input.password);
  return prisma.profile.create({
    data: {
      id: crypto.randomUUID(),
      school_id: input.school_id,
      role_id: input.role_id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      mobile: input.mobile || null,
      password_hash,
      is_active: true,
      created_by: input.created_by,
    },
    include: { role: true, school: { select: { id: true, school_name: true, school_code: true } } },
  });
}
