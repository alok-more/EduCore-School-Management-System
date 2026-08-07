import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthSession, JwtPayload, RoleName } from '@/lib/types';

export type { AuthSession };

export const SUPER_ADMIN: RoleName = 'SUPER_ADMIN';
export const SCHOOL_ADMIN: RoleName = 'SCHOOL_ADMIN';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export function isSuperAdmin(s: { role: RoleName } | null): boolean {
  return !!s && s.role === SUPER_ADMIN;
}

export function isSchoolAdmin(s: { role: RoleName } | null): boolean {
  return !!s && s.role === SCHOOL_ADMIN;
}

export function canAccessSchool(
  s: { role: RoleName; schoolId: string | null } | null,
  schoolId: string,
): boolean {
  if (!s) return false;
  if (s.role === SUPER_ADMIN) return true;
  return s.schoolId === schoolId;
}
