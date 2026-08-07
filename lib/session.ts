import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import type { AuthSession, JwtPayload } from '@/lib/types';

const COOKIE_NAME = 'educore_token';

/**
 * Reads the JWT from the request cookies and returns the session.
 * Returns null when there is no token or the token is invalid.
 */
export async function getRequestSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return payloadToSession(payload);
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getRequestSession();
  if (!session) {
    const err = new Error('Unauthorized');
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return session;
}

export async function requireSuperAdmin(): Promise<AuthSession> {
  const session = await requireSession();
  if (session.role !== 'SUPER_ADMIN') {
    const err = new Error('Forbidden');
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

export function payloadToSession(p: JwtPayload): AuthSession {
  return {
    userId: p.sub,
    email: p.email,
    role: p.role,
    schoolId: p.schoolId,
    firstName: p.firstName,
    lastName: p.lastName,
  };
}

export const AUTH_COOKIE = COOKIE_NAME;
