import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { loginWithCredentials } from '@/lib/services/auth.service';
import { apiError, badRequest, serverError } from '@/lib/api';
import { AUTH_COOKIE } from '@/lib/session';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }
  const { email, password } = parsed.data;

  const result = await loginWithCredentials(email, password);
  if (!result) {
    return apiError('Invalid email or password', 401);
  }

  const res = NextResponse.json({
    session: {
      userId: result.payload.sub,
      email: result.payload.email,
      role: result.payload.role,
      schoolId: result.payload.schoolId,
      firstName: result.payload.firstName,
      lastName: result.payload.lastName,
      mobile: result.profile.mobile,
      schoolName: result.profile.schoolName,
      schoolCode: result.profile.schoolCode,
      createdAt: result.profile.createdAt.toISOString(),
      lastLogin: result.profile.lastLogin ? result.profile.lastLogin.toISOString() : null,
      isActive: result.profile.isActive,
    },
  });
  res.cookies.set(AUTH_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
